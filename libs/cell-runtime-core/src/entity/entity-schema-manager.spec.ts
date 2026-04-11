import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema, sql } from '@ikary/system-db-core';
import { EntitySchemaManager, tableName, fieldTypeToSql, isDuplicateColumnError } from './entity-schema-manager.js';
import type { CellRuntimeDatabase } from '../db/schema.js';
import type { CellManifestV1, EntityDefinition } from '@ikary/contract';

const TEST_DB_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test';

function makeDbService(): DatabaseService<CellRuntimeDatabase> {
  return new DatabaseService<CellRuntimeDatabase>(
    databaseConnectionOptionsSchema.parse({ connectionString: TEST_DB_URL }),
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

async function tableExists(db: DatabaseService<CellRuntimeDatabase>, name: string): Promise<boolean> {
  const rows = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${name}
  `.execute(db.db);
  return rows.rows.length > 0;
}

// ── fieldTypeToSql ────────────────────────────────────────────────────────

describe('fieldTypeToSql', () => {
  const cases: Array<[string, string]> = [
    ['string', 'TEXT'],
    ['text', 'TEXT'],
    ['enum', 'TEXT'],
    ['date', 'TEXT'],
    ['datetime', 'TEXT'],
    ['number', 'NUMERIC'],
    ['boolean', 'BOOLEAN'],
    ['object', 'JSONB'],
  ];

  for (const [type, expected] of cases) {
    it(`maps "${type}" → "${expected}"`, () => {
      expect(fieldTypeToSql(type as any)).toBe(expected);
    });
  }

  it('falls back to "TEXT" for an unknown type (default branch)', () => {
    expect(fieldTypeToSql('xyz' as any)).toBe('TEXT');
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

  it('returns true for "duplicate column" message', () => {
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
  const tablesToClean: string[] = [];

  beforeEach(() => {
    dbService = makeDbService();
    manager = new EntitySchemaManager(dbService);
    tablesToClean.length = 0;
  });

  afterEach(async () => {
    for (const t of tablesToClean) {
      try { await sql.raw(`DROP TABLE IF EXISTS ${t}`).execute(dbService.db); } catch { /* ignore */ }
    }
    await dbService.destroy();
  });

  it('ensureSystemTables() creates audit_log', async () => {
    tablesToClean.push('audit_log');
    await manager.ensureSystemTables();
    expect(await tableExists(dbService, 'audit_log')).toBe(true);
  });

  it('ensureSystemTables() is idempotent (no error on second call)', async () => {
    tablesToClean.push('audit_log');
    await manager.ensureSystemTables();
    await expect(manager.ensureSystemTables()).resolves.not.toThrow();
  });

  it('initFromManifest() creates entity table', async () => {
    tablesToClean.push('entity_product');
    const manifest = {
      spec: { entities: [makeEntity('product')] },
    } as unknown as CellManifestV1;

    await manager.initFromManifest(manifest);
    expect(await tableExists(dbService, 'entity_product')).toBe(true);
  });

  it('entity table has system columns', async () => {
    tablesToClean.push('entity_widget');
    await manager.ensureEntityTable(makeEntity('widget'));

    const cols = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'entity_widget'
    `.execute(dbService.db);
    const colNames = (cols.rows as Array<{ column_name: string }>).map((r) => r.column_name);
    expect(colNames).toContain('id');
    expect(colNames).toContain('version');
    expect(colNames).toContain('created_at');
    expect(colNames).toContain('updated_at');
    expect(colNames).toContain('deleted_at');
  });

  it('entity table has user-defined field columns', async () => {
    tablesToClean.push('entity_widget2');
    await manager.ensureEntityTable(makeEntity('widget2'));

    const cols = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'entity_widget2'
    `.execute(dbService.db);
    const colNames = (cols.rows as Array<{ column_name: string }>).map((r) => r.column_name);
    expect(colNames).toContain('name');
    expect(colNames).toContain('count');
  });

  it('additive migration: new field is added without error', async () => {
    tablesToClean.push('entity_thing');
    const entity = makeEntity('thing');
    await manager.ensureEntityTable(entity);

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

  it('addColumnIfMissing re-throws non-duplicate errors', async () => {
    tablesToClean.push('audit_log');
    await manager.ensureSystemTables();
    const privManager = manager as any;
    await expect(
      privManager.addColumnIfMissing('nonexistent_table', 'col', 'TEXT'),
    ).rejects.toThrow();
  });

  it('ensureEntityTable creates table for entity with undefined fields', async () => {
    tablesToClean.push('entity_bare');
    const noFieldEntity = { key: 'bare', name: 'Bare', pluralName: 'Bares' } as any;
    await expect(manager.ensureEntityTable(noFieldEntity)).resolves.not.toThrow();
    expect(await tableExists(dbService, 'entity_bare')).toBe(true);
  });
});
