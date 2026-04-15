import type { DatabaseService, Queryable } from '@ikary/system-db-core';
import type { DomainEventEnvelope } from '@ikary/cell-contract';
import type { CellRuntimeDatabase, OutboxRow } from '../db/schema.js';

const MAX_RETRIES = 5;

export class OutboxRepository {
  constructor(private readonly dbService: DatabaseService<CellRuntimeDatabase>) {}

  async insert(event: DomainEventEnvelope, qb?: Queryable<CellRuntimeDatabase>): Promise<void> {
    const db = qb ?? this.dbService.db;
    await db
      .insertInto('domain_event_outbox')
      .values({
        event_name: event.event_name,
        tenant_id: event.tenant_id,
        workspace_id: event.workspace_id,
        cell_id: event.cell_id,
        payload: JSON.stringify(event) as unknown,
      })
      .execute();
  }

  async listUnprocessed(limit = 50): Promise<OutboxRow[]> {
    return this.dbService.db
      .selectFrom('domain_event_outbox')
      .selectAll()
      .where('processed_at', 'is', null)
      .where('failed_at', 'is', null)
      .orderBy('created_at', 'asc')
      .limit(limit)
      .execute();
  }

  async markProcessed(id: string): Promise<void> {
    await this.dbService.db
      .updateTable('domain_event_outbox')
      .set({ processed_at: new Date().toISOString() })
      .where('id', '=', id)
      .execute();
  }

  async markFailed(id: string): Promise<void> {
    const row = await this.dbService.db
      .selectFrom('domain_event_outbox')
      .select('retry_count')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!row) return;

    const newRetryCount = row.retry_count + 1;
    const permanentlyFailed = newRetryCount >= MAX_RETRIES;

    await this.dbService.db
      .updateTable('domain_event_outbox')
      .set({
        retry_count: newRetryCount,
        failed_at: permanentlyFailed ? new Date().toISOString() : null,
      })
      .where('id', '=', id)
      .execute();
  }
}
