import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema, sql } from '@ikary/system-db-core';
import { LogSettingsRepository } from './log-settings.repository.js';
import type { SystemLogDatabaseSchema } from '../db/schema.js';

const T1 = '00000000-0000-0000-0000-000000000001';
const WS1 = '00000000-0000-0000-0000-000000000002';
const CELL1 = '00000000-0000-0000-0000-000000000003';

async function createTestDb(): Promise<DatabaseService<SystemLogDatabaseSchema>> {
  const db = new DatabaseService<SystemLogDatabaseSchema>(
    databaseConnectionOptionsSchema.parse({ connectionString: 'sqlite://:memory:' }),
  );
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS log_settings (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        workspace_id TEXT,
        cell_id TEXT,
        scope TEXT NOT NULL,
        log_level TEXT NOT NULL DEFAULT 'normal',
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (tenant_id, workspace_id, cell_id)
      )`,
    )
    .execute(db.db);
  return db;
}

describe('LogSettingsRepository', () => {
  let db: DatabaseService<SystemLogDatabaseSchema>;
  let repo: LogSettingsRepository;

  beforeEach(async () => {
    db = await createTestDb();
    repo = new LogSettingsRepository(db as any);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await db.destroy();
  });

  // ── findByScope ───────────────────────────────────────────────────────────

  describe('findByScope', () => {
    it('returns undefined when no settings exist', async () => {
      expect(await repo.findByScope(T1, null, null)).toBeUndefined();
    });

    it('returns the matching tenant-level row', async () => {
      await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'verbose', expectedVersion: 0 });
      const row = await repo.findByScope(T1, null, null);
      expect(row?.log_level).toBe('verbose');
    });

    it('finds by workspace scope', async () => {
      await repo.upsert({ tenantId: T1, workspaceId: WS1, scope: 'workspace', logLevel: 'normal', expectedVersion: 0 });
      const row = await repo.findByScope(T1, WS1, null);
      expect(row?.scope).toBe('workspace');
    });

    it('finds by cell scope', async () => {
      await repo.upsert({ tenantId: T1, workspaceId: WS1, cellId: CELL1, scope: 'cell', logLevel: 'production', expectedVersion: 0 });
      const row = await repo.findByScope(T1, WS1, CELL1);
      expect(row?.scope).toBe('cell');
    });

    it('does not return row for a different tenant', async () => {
      await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'verbose', expectedVersion: 0 });
      expect(await repo.findByScope('different-tenant', null, null)).toBeUndefined();
    });
  });

  // ── upsert ────────────────────────────────────────────────────────────────

  describe('upsert', () => {
    it('inserts a new row when expectedVersion=0 and none exists', async () => {
      const row = await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'verbose', expectedVersion: 0 });
      expect(row.log_level).toBe('verbose');
      expect(row.version).toBe(1);
    });

    it('updates an existing row with the correct version', async () => {
      const created = await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'normal', expectedVersion: 0 });
      const updated = await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'production', expectedVersion: created.version });
      expect(updated.log_level).toBe('production');
      expect(updated.version).toBe(2);
    });

    it('throws 409 when expectedVersion !== 0 but no row exists', async () => {
      const err = await repo
        .upsert({ tenantId: T1, scope: 'tenant', logLevel: 'normal', expectedVersion: 1 })
        .catch((e: unknown) => e);
      expect((err as { status: number }).status).toBe(409);
    });

    it('throws 409 when expectedVersion=0 but row already exists', async () => {
      await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'normal', expectedVersion: 0 });
      const err = await repo
        .upsert({ tenantId: T1, scope: 'tenant', logLevel: 'verbose', expectedVersion: 0 })
        .catch((e: unknown) => e);
      expect((err as { status: number }).status).toBe(409);
    });

    it('throws 409 when expectedVersion does not match existing version', async () => {
      await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'normal', expectedVersion: 0 });
      const err = await repo
        .upsert({ tenantId: T1, scope: 'tenant', logLevel: 'verbose', expectedVersion: 99 })
        .catch((e: unknown) => e);
      expect((err as { status: number }).status).toBe(409);
    });

    it('throws when update returns nothing (concurrent delete race)', async () => {
      const row = await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'normal', expectedVersion: 0 });

      // Intercept the second executor() call (the updateTable call) to return undefined
      const origExecutor = (repo as any).executor.bind(repo);
      let callCount = 0;
      vi.spyOn(repo as any, 'executor').mockImplementation((client?: unknown) => {
        callCount++;
        if (callCount <= 1) return origExecutor(client);
        return {
          updateTable: () => ({
            set: () => ({
              where: () => ({
                returningAll: () => ({ executeTakeFirst: vi.fn().mockResolvedValue(undefined) }),
              }),
            }),
          }),
        };
      });

      await expect(
        repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'verbose', expectedVersion: row.version }),
      ).rejects.toThrow('Failed to update log settings.');
    });
  });

  // ── cascade ───────────────────────────────────────────────────────────────

  describe('cascade', () => {
    it('returns null when no settings at any level', async () => {
      expect(await repo.cascade(T1)).toBeNull();
    });

    it('returns tenant level when only tenant settings exist', async () => {
      await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'verbose', expectedVersion: 0 });
      expect(await repo.cascade(T1)).toBe('verbose');
    });

    it('returns workspace level over tenant when workspace settings exist', async () => {
      await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'verbose', expectedVersion: 0 });
      await repo.upsert({ tenantId: T1, workspaceId: WS1, scope: 'workspace', logLevel: 'normal', expectedVersion: 0 });
      expect(await repo.cascade(T1, WS1)).toBe('normal');
    });

    it('returns cell level over workspace when cell settings exist', async () => {
      await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'verbose', expectedVersion: 0 });
      await repo.upsert({ tenantId: T1, workspaceId: WS1, scope: 'workspace', logLevel: 'normal', expectedVersion: 0 });
      await repo.upsert({ tenantId: T1, workspaceId: WS1, cellId: CELL1, scope: 'cell', logLevel: 'production', expectedVersion: 0 });
      expect(await repo.cascade(T1, WS1, CELL1)).toBe('production');
    });

    it('falls back to workspace when only workspace+tenant exist and cell requested', async () => {
      await repo.upsert({ tenantId: T1, workspaceId: WS1, scope: 'workspace', logLevel: 'normal', expectedVersion: 0 });
      expect(await repo.cascade(T1, WS1, CELL1)).toBe('normal');
    });

    it('falls back to tenant when only tenant exists and workspace+cell requested', async () => {
      await repo.upsert({ tenantId: T1, scope: 'tenant', logLevel: 'verbose', expectedVersion: 0 });
      expect(await repo.cascade(T1, WS1, CELL1)).toBe('verbose');
    });
  });
});
