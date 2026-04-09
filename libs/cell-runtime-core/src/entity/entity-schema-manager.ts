import type { DatabaseService } from '@ikary/system-db-core';
import { sql } from '@ikary/system-db-core';
import type { CellManifestV1, EntityDefinition } from '@ikary/contract';
import type { CellRuntimeDatabase } from '../db/schema.js';
import type { FieldType } from '../shared/field-type.schema.js';

export function fieldTypeToSql(type: FieldType, isPostgres: boolean): string {
  switch (type) {
    case 'string':
    case 'text':
    case 'enum':
    case 'date':
    case 'datetime':
      return 'TEXT';
    case 'number':
      return 'NUMERIC';
    case 'boolean':
      return 'BOOLEAN';
    case 'object':
      return isPostgres ? 'JSONB' : 'TEXT';
    default:
      return 'TEXT';
  }
}

export function tableName(entityKey: string): string {
  return `entity_${entityKey}`;
}

export function isDuplicateColumnError(msg: string): boolean {
  return msg.includes('already exists') || msg.includes('duplicate column');
}

export class EntitySchemaManager {
  private readonly isPostgres: boolean;

  constructor(private readonly dbService: DatabaseService<CellRuntimeDatabase>) {
    this.isPostgres = !dbService.isSqlite;
  }

  async ensureSystemTables(): Promise<void> {
    if (this.isPostgres) {
      await sql`
        CREATE TABLE IF NOT EXISTS audit_log (
          id SERIAL PRIMARY KEY,
          entity_key TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          resource_version INTEGER NOT NULL,
          change_kind TEXT NOT NULL,
          snapshot TEXT NOT NULL,
          diff TEXT,
          occurred_at TIMESTAMPTZ NOT NULL
        )
      `.execute(this.dbService.db);
    } else {
      await sql`
        CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entity_key TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          resource_version INTEGER NOT NULL,
          change_kind TEXT NOT NULL,
          snapshot TEXT NOT NULL,
          diff TEXT,
          occurred_at TEXT NOT NULL
        )
      `.execute(this.dbService.db);
    }
  }

  async initFromManifest(manifest: CellManifestV1): Promise<void> {
    for (const entity of manifest.spec.entities ?? []) {
      await this.ensureEntityTable(entity);
    }
  }

  async ensureEntityTable(entity: EntityDefinition): Promise<void> {
    const table = tableName(entity.key);

    const userColumns = (entity.fields ?? [])
      .map((f) => `${f.key} ${fieldTypeToSql(f.type as FieldType, this.isPostgres)}`)
      .join(', ');

    const extra = userColumns ? `, ${userColumns}` : '';

    if (this.isPostgres) {
      await sql.raw(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id TEXT NOT NULL PRIMARY KEY,
          version INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          deleted_at TIMESTAMPTZ
          ${extra}
        )
      `).execute(this.dbService.db);
    } else {
      await sql.raw(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id TEXT NOT NULL PRIMARY KEY,
          version INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT
          ${extra}
        )
      `).execute(this.dbService.db);
    }

    for (const field of entity.fields ?? []) {
      await this.addColumnIfMissing(
        table,
        field.key,
        fieldTypeToSql(field.type as FieldType, this.isPostgres),
      );
    }
  }

  private async addColumnIfMissing(table: string, column: string, sqlType: string): Promise<void> {
    try {
      await sql.raw(`ALTER TABLE ${table} ADD COLUMN ${column} ${sqlType}`).execute(this.dbService.db);
    } catch (err: unknown) {
      /* v8 ignore next */
      const msg = ((err as { message?: string })?.message ?? '').toLowerCase();
      if (isDuplicateColumnError(msg)) return;
      throw err;
    }
  }
}
