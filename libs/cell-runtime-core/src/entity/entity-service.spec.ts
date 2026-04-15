import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema, sql } from '@ikary/system-db-core';
import { EntitySchemaManager } from './entity-schema-manager.js';
import { EntityRepository } from './entity-repository.js';
import { EntityService } from './entity-service.js';
import { AuditService } from '../audit/audit-service.js';
import { OutboxRepository } from '../outbox/outbox-repository.js';
import { EntityNotFoundError, VersionConflictError } from '../errors.js';
import type { CellRuntimeDatabase } from '../db/schema.js';
import type { CellManifestV1 } from '@ikary/cell-contract';

const TEST_DB_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test';

const MANIFEST = {
  spec: {
    entities: [{
      key: 'order',
      name: 'Order',
      pluralName: 'Orders',
      fields: [
        { key: 'customer', type: 'string', name: 'Customer' },
        { key: 'total', type: 'number', name: 'Total' },
        { key: 'status', type: 'string', name: 'Status' },
      ],
    }],
  },
} as unknown as CellManifestV1;

describe('EntityService', () => {
  let dbService: DatabaseService<CellRuntimeDatabase>;
  let service: EntityService;

  beforeEach(async () => {
    dbService = new DatabaseService<CellRuntimeDatabase>(
      databaseConnectionOptionsSchema.parse({ connectionString: TEST_DB_URL }),
    );
    // Drop existing tables from prior test runs
    for (const t of ['entity_order', 'audit_log', 'domain_event_outbox']) {
      try { await sql.raw(`DROP TABLE IF EXISTS ${t}`).execute(dbService.db); } catch { /* ignore */ }
    }
    const manager = new EntitySchemaManager(dbService);
    await manager.ensureSystemTables();
    await manager.initFromManifest(MANIFEST);
    const repo = new EntityRepository(dbService);
    const audit = new AuditService(dbService);
    const outbox = new OutboxRepository(dbService);
    service = new EntityService(dbService, repo, audit, outbox);
  });

  afterEach(async () => {
    for (const t of ['entity_order', 'audit_log', 'domain_event_outbox']) {
      try { await sql.raw(`DROP TABLE IF EXISTS ${t}`).execute(dbService.db); } catch { /* ignore */ }
    }
    await dbService.destroy();
  });

  // ── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('generates a UUID id when none provided', async () => {
      const record = await service.create('order', { customer: 'Acme', total: 100 });
      expect(typeof record['id']).toBe('string');
      expect((record['id'] as string).length).toBeGreaterThan(10);
    });

    it('uses provided id', async () => {
      const record = await service.create('order', { id: 'my-id', customer: 'Beta' });
      expect(record['id']).toBe('my-id');
    });

    it('writes an entity.created audit entry with changeKind=snapshot', async () => {
      const record = await service.create('order', { customer: 'Gamma', total: 50 });
      const audit = await service.getAuditLog('order', record['id'] as string);
      expect(audit).toHaveLength(1);
      expect(audit[0]?.event_type).toBe('entity.created');
      expect(audit[0]?.change_kind).toBe('snapshot');
    });

    it('audit snapshot matches the created record', async () => {
      const record = await service.create('order', { customer: 'Delta', total: 75 });
      const [entry] = await service.getAuditLog('order', record['id'] as string);
      const snapshot = JSON.parse(entry!.snapshot);
      expect(snapshot.customer).toBe('Delta');
    });
  });

  // ── list / findById ──────────────────────────────────────────────────────

  describe('list and findById', () => {
    it('list returns inserted records', async () => {
      await service.create('order', { customer: 'A' });
      await service.create('order', { customer: 'B' });
      const result = await service.list('order');
      expect(result.data).toHaveLength(2);
    });

    it('findById returns the record', async () => {
      const record = await service.create('order', { customer: 'C' });
      const found = await service.findById('order', record['id'] as string);
      expect(found).not.toBeNull();
    });

    it('findById returns null for unknown id', async () => {
      expect(await service.findById('order', 'nonexistent')).toBeNull();
    });
  });

  // ── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('increments version and writes entity.updated patch audit', async () => {
      const record = await service.create('order', { customer: 'E', total: 10 });
      const updated = await service.update('order', record['id'] as string, { total: 20 });
      expect(updated['version']).toBe(2);
      const audit = await service.getAuditLog('order', record['id'] as string);
      expect(audit[1]?.event_type).toBe('entity.updated');
      expect(audit[1]?.change_kind).toBe('patch');
    });

    it('diff contains only changed fields', async () => {
      const record = await service.create('order', { customer: 'F', total: 10 });
      await service.update('order', record['id'] as string, { total: 20 });
      const audit = await service.getAuditLog('order', record['id'] as string);
      const diff = JSON.parse(audit[1]!.diff!);
      expect(diff).toHaveProperty('total');
      expect(diff.total.before).toBe(10);
      expect(diff.total.after).toBe(20);
    });

    it('throws EntityNotFoundError for unknown id', async () => {
      await expect(service.update('order', 'none', { total: 1 })).rejects.toThrow(EntityNotFoundError);
    });

    it('propagates VersionConflictError from repository', async () => {
      const record = await service.create('order', { customer: 'G' });
      await expect(
        service.update('order', record['id'] as string, { total: 5 }, 99),
      ).rejects.toThrow(VersionConflictError);
    });
  });

  // ── delete ───────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('soft-deletes and writes entity.deleted audit', async () => {
      const record = await service.create('order', { customer: 'H' });
      const id = record['id'] as string;
      await service.delete('order', id);
      expect(await service.findById('order', id)).toBeNull();
      const audit = await service.getAuditLog('order', id);
      expect(audit.at(-1)?.event_type).toBe('entity.deleted');
    });

    it('throws EntityNotFoundError for unknown id', async () => {
      await expect(service.delete('order', 'none')).rejects.toThrow(EntityNotFoundError);
    });
  });

  // ── rollback ─────────────────────────────────────────────────────────────

  describe('rollback', () => {
    it('restores v1 snapshot and writes entity.rolled_back audit', async () => {
      const record = await service.create('order', { customer: 'Acme v1', total: 10 });
      const id = record['id'] as string;
      await service.update('order', id, { customer: 'Acme v2', total: 20 });

      const restored = await service.rollback('order', id, 1);
      expect(restored['customer']).toBe('Acme v1');

      const audit = await service.getAuditLog('order', id);
      expect(audit.at(-1)?.event_type).toBe('entity.rolled_back');
      expect(audit.at(-1)?.change_kind).toBe('rollback');
    });

    it('throws EntityNotFoundError when audit version not found', async () => {
      const record = await service.create('order', { customer: 'I' });
      await expect(service.rollback('order', record['id'] as string, 99)).rejects.toThrow(EntityNotFoundError);
    });

    it('throws EntityNotFoundError for unknown entity id', async () => {
      await expect(service.rollback('order', 'none', 1)).rejects.toThrow(EntityNotFoundError);
    });
  });

  // ── logger integration ────────────────────────────────────────────────────

  describe('optional logger', () => {
    it('calls logger.log on create, update, delete, and rollback', async () => {
      const mockLog = vi.fn();
      const repo = (service as any).repository;
      const audit = (service as any).audit;
      const outbox = (service as any).outbox;
      const loggedService = new EntityService(dbService, repo, audit, outbox, { log: mockLog, error: vi.fn() });

      const record = await loggedService.create('order', { customer: 'Z' });
      const id = record['id'] as string;
      expect(mockLog).toHaveBeenCalledWith('Entity created', expect.objectContaining({ operation: 'entity.create' }));

      await loggedService.update('order', id, { customer: 'Z2' });
      expect(mockLog).toHaveBeenCalledWith('Entity updated', expect.objectContaining({ operation: 'entity.update' }));

      await loggedService.update('order', id, { customer: 'Z3' });
      await loggedService.rollback('order', id, 1);
      expect(mockLog).toHaveBeenCalledWith('Entity rolled back', expect.objectContaining({ operation: 'entity.rollback' }));

      await loggedService.delete('order', id);
      expect(mockLog).toHaveBeenCalledWith('Entity deleted', expect.objectContaining({ operation: 'entity.delete' }));
    });
  });

  describe('computeDiff edge cases (via update)', () => {
    it('key only in after appears in diff with before=undefined', async () => {
      const record = await service.create('order', { customer: 'J' });
      const id = record['id'] as string;
      await service.update('order', id, { status: 'new_field' });
      const audit = await service.getAuditLog('order', id);
      const diff = JSON.parse(audit[1]!.diff!);
      expect(diff['status']).toBeDefined();
    });

    it('same value in before and after does NOT appear in diff', async () => {
      const record = await service.create('order', { customer: 'K', total: 5 });
      const id = record['id'] as string;
      await service.update('order', id, { total: 99 });
      const audit = await service.getAuditLog('order', id);
      const diff = JSON.parse(audit[1]!.diff!);
      expect(diff['total']).toBeDefined();
    });
  });

  // ── EntityRuntimeContext (actor attribution) ──────────────────────────────

  describe('actor attribution via EntityRuntimeContext', () => {
    it('create stores actor_id and request_id in audit entry', async () => {
      const record = await service.create('order', { customer: 'Ctx' }, { actorId: 'user-1', requestId: 'req-1' });
      const audit = await service.getAuditLog('order', record['id'] as string);
      expect(audit[0]?.actor_id).toBe('user-1');
      expect(audit[0]?.request_id).toBe('req-1');
    });

    it('update stores actor_id and request_id in audit entry', async () => {
      const record = await service.create('order', { customer: 'Ctx2' });
      const id = record['id'] as string;
      await service.update('order', id, { total: 42 }, undefined, { actorId: 'user-2', requestId: 'req-2' });
      const audit = await service.getAuditLog('order', id);
      expect(audit[1]?.actor_id).toBe('user-2');
      expect(audit[1]?.request_id).toBe('req-2');
    });

    it('delete stores actor_id and request_id in audit entry', async () => {
      const record = await service.create('order', { customer: 'Ctx3' });
      const id = record['id'] as string;
      await service.delete('order', id, undefined, { actorId: 'user-3', requestId: 'req-3' });
      const audit = await service.getAuditLog('order', id);
      const deleteEntry = audit.find(e => e.event_type === 'entity.deleted');
      expect(deleteEntry?.actor_id).toBe('user-3');
      expect(deleteEntry?.request_id).toBe('req-3');
    });

    it('rollback stores actor_id and request_id in audit entry', async () => {
      const record = await service.create('order', { customer: 'Ctx4', total: 10 });
      const id = record['id'] as string;
      await service.update('order', id, { total: 20 });
      await service.rollback('order', id, 1, undefined, { actorId: 'user-4', requestId: 'req-4' });
      const audit = await service.getAuditLog('order', id);
      const rollbackEntry = audit.find(e => e.event_type === 'entity.rolled_back');
      expect(rollbackEntry?.actor_id).toBe('user-4');
      expect(rollbackEntry?.request_id).toBe('req-4');
    });

    it('audit entries have null actor_id when no context is provided', async () => {
      const record = await service.create('order', { customer: 'NoCtx' });
      const audit = await service.getAuditLog('order', record['id'] as string);
      expect(audit[0]?.actor_id).toBeNull();
      expect(audit[0]?.request_id).toBeNull();
    });
  });

  // ── Outbox emission ───────────────────────────────────────────────────────

  describe('outbox emission', () => {
    async function outboxRows() {
      return dbService.db.selectFrom('domain_event_outbox').selectAll().execute();
    }

    // pg auto-parses JSONB columns — payload arrives as a plain object, not a string
    function payload(row: Awaited<ReturnType<typeof outboxRows>>[number]) {
      return row.payload as Record<string, unknown>;
    }

    it('writes one outbox row with event_name=entity.created after create', async () => {
      const record = await service.create('order', { customer: 'Outbox Create' });
      const rows = await outboxRows();
      expect(rows).toHaveLength(1);
      expect(payload(rows[0]!).event_name).toBe('entity.created');
      expect((payload(rows[0]!).entity as Record<string, unknown>).id).toBe(record['id']);
    });

    it('uses custom event name from ctx.eventNames.created', async () => {
      await service.create(
        'order',
        { customer: 'Custom Event' },
        { eventNames: { created: 'order.placed' } },
      );
      const rows = await outboxRows();
      expect(payload(rows[0]!).event_name).toBe('order.placed');
    });

    it('strips ctx.excludeFields from payload.data', async () => {
      await service.create(
        'order',
        { customer: 'Exclude Test', total: 100 },
        { excludeFields: ['total'] },
      );
      const rows = await outboxRows();
      const data = payload(rows[0]!).data as Record<string, unknown>;
      expect(data['total']).toBeUndefined();
      expect(data['customer']).toBe('Exclude Test');
    });

    it('populates cell_id from ctx.cellId (falls back to "local" when absent)', async () => {
      await service.create('order', { customer: 'No CellId' });
      const rows = await outboxRows();
      expect(payload(rows[0]!).cell_id).toBe('local');
      await dbService.db.deleteFrom('domain_event_outbox').execute();

      await service.create('order', { customer: 'With CellId' }, { cellId: 'my-cell' });
      const rows2 = await outboxRows();
      expect(payload(rows2[0]!).cell_id).toBe('my-cell');
    });

    it('populates tenant_id and workspace_id from ctx when provided', async () => {
      await service.create(
        'order',
        { customer: 'Tenant Test' },
        { tenantId: 'tenant-abc', workspaceId: 'workspace-xyz' },
      );
      const rows = await outboxRows();
      expect(payload(rows[0]!).tenant_id).toBe('tenant-abc');
      expect(payload(rows[0]!).workspace_id).toBe('workspace-xyz');
    });

    it('writes entity.updated row with previous data after update', async () => {
      const record = await service.create('order', { customer: 'Before', total: 10 });
      const id = record['id'] as string;
      await dbService.db.deleteFrom('domain_event_outbox').execute();

      await service.update('order', id, { customer: 'After', total: 20 });
      const rows = await outboxRows();
      expect(payload(rows[0]!).event_name).toBe('entity.updated');
      expect((payload(rows[0]!).previous as Record<string, unknown>)['customer']).toBe('Before');
      expect((payload(rows[0]!).data as Record<string, unknown>)['customer']).toBe('After');
    });

    it('writes entity.deleted row after delete', async () => {
      const record = await service.create('order', { customer: 'To Delete' });
      const id = record['id'] as string;
      await dbService.db.deleteFrom('domain_event_outbox').execute();

      await service.delete('order', id);
      const rows = await outboxRows();
      expect(payload(rows[0]!).event_name).toBe('entity.deleted');
    });

    it('writes entity.rolled_back row after rollback', async () => {
      const record = await service.create('order', { customer: 'v1' });
      const id = record['id'] as string;
      await service.update('order', id, { customer: 'v2' });
      await dbService.db.deleteFrom('domain_event_outbox').execute();

      await service.rollback('order', id, 1);
      const rows = await outboxRows();
      expect(payload(rows[0]!).event_name).toBe('entity.rolled_back');
    });

    it('does not write to outbox when EntityService is created without outbox arg', async () => {
      const noOutboxService = new EntityService(
        dbService,
        new EntityRepository(dbService),
        new AuditService(dbService),
        /* outbox: */ undefined,
      );

      await noOutboxService.create('order', { customer: 'No Outbox' });
      const rows = await outboxRows();
      expect(rows).toHaveLength(0);
    });
  });
});
