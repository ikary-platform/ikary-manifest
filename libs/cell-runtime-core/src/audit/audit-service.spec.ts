import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema, sql } from '@ikary/system-db-core';
import { EntitySchemaManager } from '../entity/entity-schema-manager.js';
import { AuditService } from './audit-service.js';
import type { CellRuntimeDatabase } from '../db/schema.js';
import type { AuditEntry } from '../shared/audit-entry.schema.js';

function makeEntry(overrides: Partial<AuditEntry> = {}): AuditEntry {
  return {
    entityKey: 'customer',
    entityId: 'uuid-1',
    eventType: 'entity.created',
    resourceVersion: 1,
    changeKind: 'snapshot',
    snapshot: { name: 'Acme' },
    ...overrides,
  };
}

describe('AuditService', () => {
  let dbService: DatabaseService<CellRuntimeDatabase>;
  let service: AuditService;

  beforeEach(async () => {
    dbService = new DatabaseService<CellRuntimeDatabase>(
      databaseConnectionOptionsSchema.parse({ connectionString: process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test' }),
    );
    try { await sql.raw('DROP TABLE IF EXISTS audit_log').execute(dbService.db); } catch { /* ignore */ }
    const manager = new EntitySchemaManager(dbService);
    await manager.ensureSystemTables();
    service = new AuditService(dbService);
  });

  afterEach(async () => {
    try { await sql.raw('DROP TABLE IF EXISTS audit_log').execute(dbService.db); } catch { /* ignore */ }
    await dbService.destroy();
  });

  it('insert() persists a row retrievable via list()', async () => {
    await service.insert(makeEntry());
    const rows = await service.list('customer', 'uuid-1');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.event_type).toBe('entity.created');
  });

  it('insert() with diff=null stores null', async () => {
    await service.insert(makeEntry({ diff: null }));
    const [row] = await service.list('customer', 'uuid-1');
    expect(row?.diff).toBeNull();
  });

  it('insert() with diff object stores JSON string', async () => {
    const diff = { name: { before: 'Old', after: 'New' } };
    await service.insert(makeEntry({ diff }));
    const [row] = await service.list('customer', 'uuid-1');
    expect(JSON.parse(row!.diff!)).toEqual(diff);
  });

  it('list() returns entries in resource_version ascending order', async () => {
    await service.insert(makeEntry({ resourceVersion: 2 }));
    await service.insert(makeEntry({ resourceVersion: 1 }));
    const rows = await service.list('customer', 'uuid-1');
    expect(rows[0]?.resource_version).toBe(1);
    expect(rows[1]?.resource_version).toBe(2);
  });

  it('list() filters by entityKey and entityId', async () => {
    await service.insert(makeEntry({ entityKey: 'order', entityId: 'other-id' }));
    await service.insert(makeEntry({ entityKey: 'customer', entityId: 'uuid-1' }));

    const customerRows = await service.list('customer', 'uuid-1');
    expect(customerRows).toHaveLength(1);

    const orderRows = await service.list('order', 'other-id');
    expect(orderRows).toHaveLength(1);
  });

  it('list() returns empty array when no entries exist', async () => {
    const rows = await service.list('customer', 'nonexistent');
    expect(rows).toHaveLength(0);
  });

  it('findByVersion() returns the correct row', async () => {
    await service.insert(makeEntry({ resourceVersion: 1 }));
    await service.insert(makeEntry({ resourceVersion: 2 }));

    const row = await service.findByVersion('customer', 'uuid-1', 1);
    expect(row).not.toBeNull();
    expect(row?.resource_version).toBe(1);
  });

  it('findByVersion() returns null when version is not found', async () => {
    const row = await service.findByVersion('customer', 'uuid-1', 99);
    expect(row).toBeNull();
  });
});
