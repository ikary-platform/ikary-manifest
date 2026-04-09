import type { ColumnType, Generated, Insertable, Selectable } from '@ikary/system-db-core';

// ---------------------------------------------------------------------------
// Audit log — one shared table across all entities
// ---------------------------------------------------------------------------

export interface AuditLogTable {
  id: Generated<number>;
  entity_key: string;
  entity_id: string;
  event_type: string;
  resource_version: number;
  change_kind: string;
  snapshot: string; // JSON
  diff: string | null; // JSON patch — null for creates
  occurred_at: ColumnType<string, string, never>; // ISO-8601
}

export type AuditLogRow = Selectable<AuditLogTable>;
export type NewAuditLog = Insertable<AuditLogTable>;

// ---------------------------------------------------------------------------
// Entity records — one table per entity key: entity_{key}
// ---------------------------------------------------------------------------

export interface EntityBaseTable {
  id: string;
  version: Generated<number>;
  created_at: ColumnType<string, string, never>;
  updated_at: string;
  deleted_at: string | null;
}

// ---------------------------------------------------------------------------
// Top-level DB interface
// ---------------------------------------------------------------------------

export interface CellRuntimeDatabase {
  audit_log: AuditLogTable;
}
