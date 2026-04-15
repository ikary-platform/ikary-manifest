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
  actor_id: string | null;
  request_id: string | null;
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
// Transactional outbox — durable event staging before broker dispatch
// ---------------------------------------------------------------------------

export interface OutboxTable {
  id: Generated<string>;
  created_at: ColumnType<string, string | undefined, never>;
  processed_at: string | null;
  failed_at: string | null;
  retry_count: Generated<number>;
  event_name: string;
  /** Multi-tenancy dimensions — nullable in local/preview mode. */
  tenant_id: string | null;
  workspace_id: string | null;
  cell_id: string | null;
  /** Full serialised DomainEventEnvelope (JSONB). */
  payload: unknown;
}

export type OutboxRow = Selectable<OutboxTable>;
export type NewOutbox = Insertable<OutboxTable>;

// ---------------------------------------------------------------------------
// Top-level DB interface
// ---------------------------------------------------------------------------

export interface CellRuntimeDatabase {
  audit_log: AuditLogTable;
  domain_event_outbox: OutboxTable;
}
