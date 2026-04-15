import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema, sql } from '@ikary/system-db-core';
import { EntitySchemaManager } from '../entity/entity-schema-manager.js';
import { OutboxRepository } from './outbox-repository.js';
import type { CellRuntimeDatabase } from '../db/schema.js';
import type { DomainEventEnvelope } from '@ikary/cell-contract';

const TEST_DB_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test';

function buildEvent(overrides: Partial<DomainEventEnvelope> = {}): DomainEventEnvelope {
  return {
    event_id: 'evt-1',
    event_name: 'entity.created',
    version: 1,
    timestamp: new Date().toISOString(),
    tenant_id: 'tenant-1',
    workspace_id: 'workspace-1',
    cell_id: 'cell-1',
    actor: { type: 'user', id: 'user-1' },
    entity: { type: 'order', id: 'record-1' },
    data: { field: 'value' },
    previous: {},
    metadata: {},
    ...overrides,
  };
}

describe('OutboxRepository', () => {
  let dbService: DatabaseService<CellRuntimeDatabase>;
  let repo: OutboxRepository;

  beforeEach(async () => {
    dbService = new DatabaseService<CellRuntimeDatabase>(
      databaseConnectionOptionsSchema.parse({ connectionString: TEST_DB_URL }),
    );
    try {
      await sql.raw('DROP TABLE IF EXISTS domain_event_outbox').execute(dbService.db);
    } catch { /* ignore */ }

    const manager = new EntitySchemaManager(dbService);
    await manager.ensureSystemTables();
    repo = new OutboxRepository(dbService);
  });

  afterEach(async () => {
    try {
      await sql.raw('DROP TABLE IF EXISTS domain_event_outbox').execute(dbService.db);
    } catch { /* ignore */ }
    await dbService.destroy();
  });

  // ── insert ────────────────────────────────────────────────────────────────

  describe('insert', () => {
    it('creates a row with correct event_name', async () => {
      await repo.insert(buildEvent({ event_name: 'invoice.created' }));
      const rows = await repo.listUnprocessed();
      expect(rows).toHaveLength(1);
      expect(rows[0]?.event_name).toBe('invoice.created');
    });

    it('stores tenant_id, workspace_id, cell_id from the envelope', async () => {
      await repo.insert(buildEvent({ tenant_id: 't1', workspace_id: 'w1', cell_id: 'c1' }));
      const rows = await repo.listUnprocessed();
      expect(rows[0]?.tenant_id).toBe('t1');
      expect(rows[0]?.workspace_id).toBe('w1');
      expect(rows[0]?.cell_id).toBe('c1');
    });

    it('stores the full envelope as JSONB payload', async () => {
      const event = buildEvent({ event_id: 'abc-123' });
      await repo.insert(event);
      const rows = await repo.listUnprocessed();
      const payload = rows[0]?.payload as DomainEventEnvelope;
      expect(payload.event_id).toBe('abc-123');
      expect(payload.entity.type).toBe('order');
    });

    it('new row has processed_at = null and retry_count = 0', async () => {
      await repo.insert(buildEvent());
      const rows = await repo.listUnprocessed();
      expect(rows[0]?.processed_at).toBeNull();
      expect(rows[0]?.retry_count).toBe(0);
    });
  });

  // ── listUnprocessed ───────────────────────────────────────────────────────

  describe('listUnprocessed', () => {
    it('returns only rows with processed_at IS NULL and failed_at IS NULL', async () => {
      await repo.insert(buildEvent({ event_id: 'a' }));
      await repo.insert(buildEvent({ event_id: 'b' }));
      await repo.insert(buildEvent({ event_id: 'c' }));

      const rows = await repo.listUnprocessed();
      const ids = rows.map((r) => (r.payload as DomainEventEnvelope).event_id);
      expect(ids).toContain('a');
      expect(ids).toContain('b');
      expect(ids).toContain('c');
    });

    it('excludes rows with processed_at set', async () => {
      await repo.insert(buildEvent({ event_id: 'done' }));
      await repo.insert(buildEvent({ event_id: 'pending' }));

      const doneId = (await repo.listUnprocessed()).find(
        (r) => (r.payload as DomainEventEnvelope).event_id === 'done',
      )!.id as string;
      await repo.markProcessed(doneId);

      const rows = await repo.listUnprocessed();
      const ids = rows.map((r) => (r.payload as DomainEventEnvelope).event_id);
      expect(ids).not.toContain('done');
      expect(ids).toContain('pending');
    });

    it('excludes permanently failed rows (failed_at IS NOT NULL)', async () => {
      await repo.insert(buildEvent({ event_id: 'perm-fail' }));
      const id = (await repo.listUnprocessed())[0]!.id as string;

      // Call markFailed MAX_RETRIES (5) times
      for (let i = 0; i < 5; i++) {
        await repo.markFailed(id);
      }

      const rows = await repo.listUnprocessed();
      const ids = rows.map((r) => (r.payload as DomainEventEnvelope).event_id);
      expect(ids).not.toContain('perm-fail');
    });

    it('respects limit parameter', async () => {
      await repo.insert(buildEvent({ event_id: 'x1' }));
      await repo.insert(buildEvent({ event_id: 'x2' }));
      await repo.insert(buildEvent({ event_id: 'x3' }));

      const rows = await repo.listUnprocessed(2);
      expect(rows).toHaveLength(2);
    });

    it('returns rows ordered by created_at ASC', async () => {
      await repo.insert(buildEvent({ event_id: 'first' }));
      await repo.insert(buildEvent({ event_id: 'second' }));

      const rows = await repo.listUnprocessed();
      const ids = rows.map((r) => (r.payload as DomainEventEnvelope).event_id);
      expect(ids.indexOf('first')).toBeLessThan(ids.indexOf('second'));
    });
  });

  // ── markProcessed ─────────────────────────────────────────────────────────

  describe('markProcessed', () => {
    it('sets processed_at on the row', async () => {
      await repo.insert(buildEvent());
      const id = (await repo.listUnprocessed())[0]!.id as string;

      await repo.markProcessed(id);

      const rows = await dbService.db
        .selectFrom('domain_event_outbox')
        .selectAll()
        .where('id', '=', id)
        .execute();
      expect(rows[0]?.processed_at).not.toBeNull();
    });

    it('row no longer appears in listUnprocessed after marking processed', async () => {
      await repo.insert(buildEvent());
      const id = (await repo.listUnprocessed())[0]!.id as string;

      await repo.markProcessed(id);

      expect(await repo.listUnprocessed()).toHaveLength(0);
    });
  });

  // ── markFailed ───────────────────────────────────────────────────────────

  describe('markFailed', () => {
    it('increments retry_count each call', async () => {
      await repo.insert(buildEvent());
      const id = (await repo.listUnprocessed())[0]!.id as string;

      await repo.markFailed(id);
      await repo.markFailed(id);

      const rows = await dbService.db
        .selectFrom('domain_event_outbox')
        .selectAll()
        .where('id', '=', id)
        .execute();
      expect(rows[0]?.retry_count).toBe(2);
    });

    it('keeps failed_at = null while retry_count < MAX_RETRIES', async () => {
      await repo.insert(buildEvent());
      const id = (await repo.listUnprocessed())[0]!.id as string;

      await repo.markFailed(id); // retry_count = 1
      await repo.markFailed(id); // retry_count = 2

      const rows = await dbService.db
        .selectFrom('domain_event_outbox')
        .selectAll()
        .where('id', '=', id)
        .execute();
      expect(rows[0]?.failed_at).toBeNull();
      expect(rows[0]?.retry_count).toBe(2);
    });

    it('sets failed_at once retry_count reaches MAX_RETRIES (5)', async () => {
      await repo.insert(buildEvent());
      const id = (await repo.listUnprocessed())[0]!.id as string;

      for (let i = 0; i < 5; i++) {
        await repo.markFailed(id);
      }

      const rows = await dbService.db
        .selectFrom('domain_event_outbox')
        .selectAll()
        .where('id', '=', id)
        .execute();
      expect(rows[0]?.retry_count).toBe(5);
      expect(rows[0]?.failed_at).not.toBeNull();
    });

    it('does nothing for unknown id', async () => {
      await expect(repo.markFailed('00000000-0000-0000-0000-000000000000')).resolves.toBeUndefined();
    });
  });
});
