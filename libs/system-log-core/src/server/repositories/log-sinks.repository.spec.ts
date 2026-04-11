import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema, sql } from '@ikary/system-db-core';
import { LogSinksRepository } from './log-sinks.repository.js';
import type { SystemLogDatabaseSchema } from '../db/schema.js';

const T1 = '00000000-0000-0000-0000-000000000001';
const WS1 = '00000000-0000-0000-0000-000000000002';
const CELL1 = '00000000-0000-0000-0000-000000000003';

async function createTestDb(): Promise<DatabaseService<SystemLogDatabaseSchema>> {
  const db = new DatabaseService<SystemLogDatabaseSchema>(
    databaseConnectionOptionsSchema.parse({ connectionString: process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test' }),
  );
  await sql
    .raw(
      `DROP TABLE IF EXISTS log_sinks;
       CREATE TABLE log_sinks (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        workspace_id TEXT,
        cell_id TEXT,
        scope TEXT NOT NULL,
        sink_type TEXT NOT NULL,
        retention_hours INTEGER NOT NULL,
        config TEXT NOT NULL DEFAULT '{}',
        is_enabled BOOLEAN NOT NULL DEFAULT true,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT NOW(),
        updated_at TEXT NOT NULL DEFAULT NOW()
      )`,
    )
    .execute(db.db);
  return db;
}

describe('LogSinksRepository', () => {
  let db: DatabaseService<SystemLogDatabaseSchema>;
  let repo: LogSinksRepository;

  beforeEach(async () => {
    db = await createTestDb();
    repo = new LogSinksRepository(db as any);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    try { await sql.raw('DROP TABLE IF EXISTS log_sinks').execute(db.db); } catch { /* ignore */ }
    await db.destroy();
  });

  async function insertSink(overrides: Partial<Parameters<typeof repo.insert>[0]> = {}) {
    return repo.insert({
      tenantId: T1,
      scope: 'tenant',
      sinkType: 'persistent',
      retentionHours: 72,
      config: {},
      ...overrides,
    });
  }

  // ── findEnabled ───────────────────────────────────────────────────────────

  describe('findEnabled', () => {
    it('returns empty when no sinks', async () => {
      expect(await repo.findEnabled(T1)).toHaveLength(0);
    });

    it('returns tenant-scope sinks with no workspace filter', async () => {
      await insertSink();
      expect(await repo.findEnabled(T1)).toHaveLength(1);
    });

    it('returns tenant-scope sinks when workspace specified', async () => {
      await insertSink(); // tenant-level, workspace_id = null
      const rows = await repo.findEnabled(T1, WS1);
      expect(rows).toHaveLength(1);
    });

    it('excludes sinks for a different workspace', async () => {
      await insertSink({ workspaceId: WS1, scope: 'workspace' });
      const rows = await repo.findEnabled(T1, 'other-workspace');
      expect(rows).toHaveLength(0);
    });

    it('returns cell-scope sinks when cell specified', async () => {
      await insertSink({ workspaceId: WS1, cellId: CELL1, scope: 'cell' });
      const rows = await repo.findEnabled(T1, WS1, CELL1);
      expect(rows).toHaveLength(1);
    });

    it('excludes disabled sinks', async () => {
      const sink = await insertSink();
      await repo.update({ id: sink.id, tenantId: T1, isEnabled: false, expectedVersion: 1 });
      expect(await repo.findEnabled(T1)).toHaveLength(0);
    });

    it('does not return sinks for a different tenant', async () => {
      await insertSink();
      expect(await repo.findEnabled('other-tenant')).toHaveLength(0);
    });

    it('returns sinks when no cellId filter and cellId=null stored', async () => {
      await insertSink(); // cell_id is null
      const rows = await repo.findEnabled(T1, undefined, undefined);
      expect(rows).toHaveLength(1);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the sink by id', async () => {
      const created = await insertSink();
      const found = await repo.findById(created.id, T1);
      expect(found?.id).toBe(created.id);
    });

    it('returns undefined for unknown id', async () => {
      expect(await repo.findById('unknown-id', T1)).toBeUndefined();
    });

    it('returns undefined for wrong tenant', async () => {
      const created = await insertSink();
      expect(await repo.findById(created.id, 'other-tenant')).toBeUndefined();
    });
  });

  // ── insert ────────────────────────────────────────────────────────────────

  describe('insert', () => {
    it('creates a new sink with version=1 and is_enabled=true', async () => {
      const row = await insertSink();
      expect(row.version).toBe(1);
      expect(row.is_enabled).toBe(true);
      expect(row.sink_type).toBe('persistent');
      expect(row.retention_hours).toBe(72);
    });

    it('stores workspace and cell scope correctly', async () => {
      const row = await insertSink({ workspaceId: WS1, cellId: CELL1, scope: 'cell' });
      expect(row.workspace_id).toBe(WS1);
      expect(row.cell_id).toBe(CELL1);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates retention_hours and increments version', async () => {
      const created = await insertSink();
      const updated = await repo.update({
        id: created.id,
        tenantId: T1,
        retentionHours: 48,
        expectedVersion: 1,
      });
      expect(updated.retention_hours).toBe(48);
      expect(updated.version).toBe(2);
    });

    it('updates config', async () => {
      const created = await insertSink();
      const updated = await repo.update({
        id: created.id,
        tenantId: T1,
        config: { endpoint: 'https://example.com' },
        expectedVersion: 1,
      });
      // config is stored as JSON string
      expect(updated).toBeDefined();
    });

    it('updates isEnabled to false', async () => {
      const created = await insertSink();
      const updated = await repo.update({
        id: created.id,
        tenantId: T1,
        isEnabled: false,
        expectedVersion: 1,
      });
      expect(updated.is_enabled).toBe(0);
    });

    it('updates isEnabled to true (truthy branch of isEnabled ? 1 : 0)', async () => {
      const created = await insertSink();
      await repo.update({ id: created.id, tenantId: T1, isEnabled: false, expectedVersion: 1 });
      const updated = await repo.update({ id: created.id, tenantId: T1, isEnabled: true, expectedVersion: 2 });
      expect(updated.is_enabled).toBe(1);
    });

    it('throws 404 for unknown sink id', async () => {
      const err = await repo
        .update({ id: 'unknown', tenantId: T1, expectedVersion: 1 })
        .catch((e: unknown) => e);
      expect((err as { status: number }).status).toBe(404);
    });

    it('throws 409 for version conflict', async () => {
      const created = await insertSink();
      const err = await repo
        .update({ id: created.id, tenantId: T1, expectedVersion: 99 })
        .catch((e: unknown) => e);
      expect((err as { status: number }).status).toBe(409);
    });

    it('throws when UPDATE returns nothing (concurrent delete race)', async () => {
      const created = await insertSink();

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
        repo.update({ id: created.id, tenantId: T1, expectedVersion: 1 }),
      ).rejects.toThrow('Failed to update log sink.');
    });
  });
});
