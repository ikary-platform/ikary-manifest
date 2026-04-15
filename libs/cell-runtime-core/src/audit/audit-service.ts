import type { DatabaseService, Queryable } from '@ikary/system-db-core';
import type { CellRuntimeDatabase, AuditLogRow, NewAuditLog } from '../db/schema.js';
import type { AuditEntry } from '../shared/audit-entry.schema.js';

export type { AuditEntry };

export class AuditService {
  constructor(private readonly dbService: DatabaseService<CellRuntimeDatabase>) {}

  async insert(entry: AuditEntry, qb?: Queryable<CellRuntimeDatabase>): Promise<void> {
    const row: NewAuditLog = {
      entity_key: entry.entityKey,
      entity_id: entry.entityId,
      event_type: entry.eventType,
      resource_version: entry.resourceVersion,
      change_kind: entry.changeKind,
      snapshot: JSON.stringify(entry.snapshot),
      diff: entry.diff ? JSON.stringify(entry.diff) : null,
      actor_id: entry.actorId ?? null,
      request_id: entry.requestId ?? null,
      occurred_at: new Date().toISOString(),
    };

    const db = qb ?? this.dbService.db;
    await db.insertInto('audit_log').values(row).execute();
  }

  async list(entityKey: string, entityId: string): Promise<AuditLogRow[]> {
    return this.dbService.db
      .selectFrom('audit_log')
      .selectAll()
      .where('entity_key', '=', entityKey)
      .where('entity_id', '=', entityId)
      .orderBy('resource_version', 'asc')
      .execute();
  }

  async findByVersion(entityKey: string, entityId: string, version: number): Promise<AuditLogRow | null> {
    const row = await this.dbService.db
      .selectFrom('audit_log')
      .selectAll()
      .where('entity_key', '=', entityKey)
      .where('entity_id', '=', entityId)
      .where('resource_version', '=', version)
      .executeTakeFirst();

    return row ?? null;
  }
}
