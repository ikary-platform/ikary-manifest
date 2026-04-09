import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';
import { EntitySchemaManager, tableName, fieldTypeToSql, isDuplicateColumnError } from './entity-schema-manager.js';
import type { CellRuntimeDatabase } from '../db/schema.js';
import type { CellManifestV1, EntityDefinition } from '@ikary/contract';

function makeDbService(): DatabaseService<CellRuntimeDatabase> {
  return new DatabaseService<CellRuntimeDatabase>(
    databaseConnectionOptionsSchema.parse({ connectionString: 'sqlite://:memory:' }),
  );
}

function makeEntity(key = 'item', extra: Partial<EntityDefinition> = {}): EntityDefinition {
  return {
    key,
    name: 'Item',
    pluralName: 'Items',
    fields: [
      { key: 'name', type: 'string', name: 'Name' },
      { key: 'count', type: 'number', name: 'Count' },
    ],
    ...extra,
  } as EntityDefinition;
}

// ── fieldTypeToSql ────────────────────────────────────────────────────────

describe('fieldTypeToSql', () => {
  const sqliteCases: Array<[string, string]> = [
    ['string', 'TEXT'],
    ['text', 'TEXT'],
    ['enum', 'TEXT'],
    ['date', 'TEXT'],
    ['datetime', 'TEXT'],
    ['number', 'NUMERIC'],
    ['boolean', 'BOOLEAN'],
    ['object', 'TEXT'],
  ];

  for (const [type, expected] of sqliteCases) {
    it(`maps "${type}" → "${expected}" for SQLite`, () => {
      expect(fieldTypeToSql(type as any, false)).toBe(expected);
    });
  }

  it('maps "object" → "JSONB" for Postgres', () => {
    expect(fieldTypeToSql('object', true)).toBe('JSONB');
  });

  it('falls back to "TEXT" for an unknown type (default branch)', () => {
    expect(fieldTypeToSql('xyz' as any, false)).toBe('TEXT');
  });
});

// ── tableName ─────────────────────────────────────────────────────────────

describe('tableName', () => {
  it('returns entity_{key}', () => {
    expect(tableName('customer')).toBe('entity_customer');
  });
});

// ── isDuplicateColumnError ────────────────────────────────────────────────

describe('isDuplicateColumnError', () => {
  it('returns true for "already exists" message (Postgres style)', () => {
    expect(isDuplicateColumnError('column "name" of relation "t" already exists')).toBe(true);
  });

  it('returns true for "duplicate column" message (SQLite style)', () => {
    expect(isDuplicateColumnError('duplicate column name: status')).toBe(true);
  });

  it('returns false for unrelated error messages', () => {
    expect(isDuplicateColumnError('no such table: entity_foo')).toBe(false);
  });
});

// ── EntitySchemaManager ───────────────────────────────────────────────────

describe('EntitySchemaManager', () => {
  let dbService: DatabaseService<CellRuntimeDatabase>;
  let manager: EntitySchemaManager;

  beforeEach(() => {
    dbService = makeDbService();
    manager = new EntitySchemaManager(dbService);
  });

  afterEach(async () => {
    await dbService.destroy();
  });

  it('ensureSystemTables() creates audit_log', async () => {
    await manager.ensureSystemTables();
    const rows = await (dbService.db as any)
      .selectFrom('sqlite_master')
      .where('type', '=', 'table')
      .where('name', '=', 'audit_log')
      .selectAll()
      .execute();
    expect(rows.length).toBe(1);
  });

  it('ensureSystemTables() is idempotent (no error on second call)', async () => {
    await manager.ensureSystemTables();
    await expect(manager.ensureSystemTables()).resolves.not.toThrow();
  });

  it('initFromManifest() creates entity table', async () => {
    const manifest = {
      spec: { entities: [makeEntity('product')] },
    } as unknown as CellManifestV1;

    await manager.initFromManifest(manifest);

    const rows = await (dbService.db as any)
      .selectFrom('sqlite_master')
      .where('type', '=', 'table')
      .where('name', '=', 'entity_product')
      .selectAll()
      .execute();
    expect(rows.length).toBe(1);
  });

  it('entity table has system columns', async () => {
    await manager.ensureEntityTable(makeEntity('widget'));
    const rows = await (dbService.db as any)
      .selectFrom('sqlite_master')
      .where('type', '=', 'table')
      .where('name', '=', 'entity_widget')
      .selectAll()
      .execute();
    const sql = rows[0].sql as string;
    expect(sql).toContain('id');
    expect(sql).toContain('version');
    expect(sql).toContain('created_at');
    expect(sql).toContain('updated_at');
    expect(sql).toContain('deleted_at');
  });

  it('entity table has user-defined field columns', async () => {
    await manager.ensureEntityTable(makeEntity('widget'));
    const rows = await (dbService.db as any)
      .selectFrom('sqlite_master')
      .where('name', '=', 'entity_widget')
      .selectAll()
      .execute();
    const ddl = rows[0].sql as string;
    expect(ddl).toContain('name');
    expect(ddl).toContain('count');
  });

  it('additive migration: new field is added without error', async () => {
    const entity = makeEntity('thing');
    await manager.ensureEntityTable(entity);

    // Add a new field
    const updated = { ...entity, fields: [...entity.fields!, { key: 'status', type: 'string', name: 'Status' }] };
    await expect(manager.ensureEntityTable(updated as any)).resolves.not.toThrow();
  });

  it('initFromManifest() handles empty entities array without error', async () => {
    const manifest = { spec: { entities: [] } } as unknown as CellManifestV1;
    await expect(manager.initFromManifest(manifest)).resolves.not.toThrow();
  });

  it('initFromManifest() handles undefined entities without error', async () => {
    const manifest = { spec: {} } as unknown as CellManifestV1;
    await expect(manager.initFromManifest(manifest)).resolves.not.toThrow();
  });

  it('Postgres path (isPostgres=true) runs DDL without error on SQLite', async () => {
    // SQLite accepts TIMESTAMPTZ/JSONB as TEXT affinity — this exercises the postgres branches
    const pgDbService = new DatabaseService<CellRuntimeDatabase>(
      databaseConnectionOptionsSchema.parse({ connectionString: 'sqlite://:memory:' }),
    );
    // Force isPostgres by monkey-patching isSqlite
    Object.defineProperty(pgDbService, 'isSqlite', { value: false });
    const pgManager = new EntitySchemaManager(pgDbService);

    await expect(pgManager.ensureSystemTables()).resolves.not.toThrow();
    await expect(pgManager.ensureEntityTable(makeEntity('pgtest'))).resolves.not.toThrow();
    await pgDbService.destroy();
  });

  it('addColumnIfMissing re-throws non-duplicate errors', async () => {
    // Use a non-existent table to trigger an error that is not a duplicate-column error
    await manager.ensureSystemTables();
    // Access private method via cast
    const privManager = manager as any;
    await expect(
      privManager.addColumnIfMissing('nonexistent_table', 'col', 'TEXT'),
    ).rejects.toThrow();
  });

  it('ensureEntityTable creates table for entity with undefined fields', async () => {
    // entity.fields ?? [] — covers the null-coalescing branch and empty userColumns branch
    const noFieldEntity = { key: 'bare', name: 'Bare', pluralName: 'Bares' } as any;
    await expect(manager.ensureEntityTable(noFieldEntity)).resolves.not.toThrow();
    const rows = await (dbService.db as any)
      .selectFrom('sqlite_master')
      .where('type', '=', 'table')
      .where('name', '=', 'entity_bare')
      .selectAll()
      .execute();
    expect(rows.length).toBe(1);
  });
});
