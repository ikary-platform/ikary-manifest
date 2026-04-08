import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

// ---------------------------------------------------------------------------
// Audit log — one shared table across all entities
// ---------------------------------------------------------------------------

export interface AuditLogTable {
  id: Generated<number>;
  entity_key: string;
  entity_id: string;
  event_type: string; // 'entity.created' | 'entity.updated' | 'entity.deleted' | 'entity.rolled_back'
  resource_version: number;
  change_kind: string; // 'snapshot' | 'patch' | 'rollback'
  snapshot: string; // JSON
  diff: string | null; // JSON patch — null for creates
  occurred_at: ColumnType<string, string, never>; // ISO-8601
}

export type AuditLogRow = Selectable<AuditLogTable>;
export type NewAuditLog = Insertable<AuditLogTable>;

// ---------------------------------------------------------------------------
// Entity records — one table per entity key: entity_{key}
// Each entity table has these system columns plus user-defined data columns.
// ---------------------------------------------------------------------------

export interface EntityBaseTable {
  id: string; // UUID / user-supplied key
  version: Generated<number>;
  created_at: ColumnType<string, string, never>;
  updated_at: string;
  deleted_at: string | null;
}

// ---------------------------------------------------------------------------
// Top-level DB interface (system tables only; entity tables are dynamic)
// ---------------------------------------------------------------------------

export interface CellRuntimeDatabase {
  audit_log: AuditLogTable;
  // entity_{key} tables are accessed via db.dynamic.table()
}
