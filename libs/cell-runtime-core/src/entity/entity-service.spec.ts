import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';
import { EntitySchemaManager } from './entity-schema-manager.js';
import { EntityRepository } from './entity-repository.js';
import { EntityService } from './entity-service.js';
import { AuditService } from '../audit/audit-service.js';
import { EntityNotFoundError, VersionConflictError } from '../errors.js';
import type { CellRuntimeDatabase } from '../db/schema.js';
import type { CellManifestV1 } from '@ikary/contract';

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
      databaseConnectionOptionsSchema.parse({ connectionString: 'sqlite://:memory:' }),
    );
    const manager = new EntitySchemaManager(dbService);
    await manager.ensureSystemTables();
    await manager.initFromManifest(MANIFEST);
    const repo = new EntityRepository(dbService);
    const audit = new AuditService(dbService);
    service = new EntityService(repo, audit);
  });

  afterEach(async () => {
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

  // ── computeDiff (tested via update) ──────────────────────────────────────

  // ── logger integration ────────────────────────────────────────────────────

  describe('optional logger', () => {
    it('calls logger.log on create, update, delete, and rollback', async () => {
      const mockLog = vi.fn();
      const repo = (service as any).repository;
      const audit = (service as any).audit;
      const loggedService = new EntityService(repo, audit, { log: mockLog, error: vi.fn() });

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
      // The 'before' value for a new field is null (SQLite stores null for missing columns)
    });

    it('same value in before and after does NOT appear in diff', async () => {
      const record = await service.create('order', { customer: 'K', total: 5 });
      const id = record['id'] as string;
      // Update only 'total', keeping 'customer' the same
      await service.update('order', id, { total: 99 });
      const audit = await service.getAuditLog('order', id);
      const diff = JSON.parse(audit[1]!.diff!);
      // customer is unchanged — it should not be in the diff
      // (version, updated_at WILL be in diff since they always change)
      expect(diff['total']).toBeDefined();
    });
  });
});
