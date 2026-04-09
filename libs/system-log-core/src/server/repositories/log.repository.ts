import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { Insertable, Queryable, Selectable } from '@ikary/system-db-core';
import { SYSTEM_LOG_DATABASE } from '../log.tokens';
import type { SystemLogDatabase, LogEntry } from '../log.types';
import type { PlatformLogsTable, SystemLogDatabaseSchema } from '../db/schema';
import type { LogEntryLevel } from '../../shared/log-level.schema';

export type PlatformLogRow = Selectable<PlatformLogsTable>;

export interface LogQueryFilter {
  tenantId: string;
  workspaceId?: string;
  cellId?: string;
  levels?: LogEntryLevel[];
  source?: string;
  correlationId?: string;
  from?: Date;
  to?: Date;
  search?: string;
  before?: Date;
  beforeId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class LogRepository {
  constructor(@Inject(SYSTEM_LOG_DATABASE) private readonly db: SystemLogDatabase) {}

  private executor(client?: Queryable<SystemLogDatabaseSchema>) {
    return (client ?? this.db.db) as Queryable<SystemLogDatabaseSchema>;
  }

  async insert(
    entry: LogEntry,
    sinkType: 'ui' | 'persistent' | 'external',
    expiresAt: Date | null,
    client?: Queryable<SystemLogDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .insertInto('platform_logs')
      .values({
        id: randomUUID(),
        tenant_id: entry.tenantId,
        tenant_slug: entry.tenantSlug,
        workspace_id: entry.workspaceId ?? null,
        workspace_slug: entry.workspaceSlug ?? null,
        cell_id: entry.cellId ?? null,
        cell_slug: entry.cellSlug ?? null,
        service: entry.service,
        operation: entry.operation,
        level: entry.level,
        message: entry.message,
        source: entry.source ?? null,
        metadata: entry.metadata ?? null,
        request_id: entry.requestId ?? null,
        trace_id: entry.traceId ?? null,
        span_id: entry.spanId ?? null,
        correlation_id: entry.correlationId ?? null,
        actor_id: entry.actorId ?? null,
        actor_type: entry.actorType ?? null,
        sink_type: sinkType,
        expires_at: expiresAt,
      } satisfies Insertable<PlatformLogsTable>)
      .execute();
  }

  async find(filter: LogQueryFilter): Promise<PlatformLogRow[]> {
    const pageSize = Math.min(filter.pageSize ?? 1000, 1000);
    const useCursor = filter.before != null && filter.beforeId != null;

    let q = this.executor().selectFrom('platform_logs').selectAll().where('tenant_id', '=', filter.tenantId);

    if (filter.workspaceId) {
      q = q.where('workspace_id', '=', filter.workspaceId);
    }
    if (filter.cellId) {
      q = q.where('cell_id', '=', filter.cellId);
    }
    if (filter.levels && filter.levels.length > 0) {
      q = q.where('level', 'in', filter.levels);
    }
    if (filter.source) {
      q = q.where('source', '=', filter.source);
    }
    if (filter.correlationId) {
      q = q.where('correlation_id', '=', filter.correlationId);
    }
    if (filter.from) {
      q = q.where('logged_at', '>=', filter.from);
    }
    if (filter.to) {
      q = q.where('logged_at', '<=', filter.to);
    }
    if (filter.search) {
      const term = `%${filter.search}%`;
      q = q.where((eb) => eb.or([eb('message', 'ilike', term), eb('operation', 'ilike', term)]));
    }

    if (useCursor) {
      q = q.where((eb) =>
        eb.or([
          eb('logged_at', '<', filter.before!),
          eb.and([eb('logged_at', '=', filter.before!), eb('id', '<', filter.beforeId!)]),
        ]),
      );
    } else {
      const page = filter.page ?? 1;
      const offset = (page - 1) * pageSize;
      q = q.offset(offset);
    }

    return q.orderBy('logged_at', 'desc').limit(pageSize).execute();
  }

  async deleteExpired(client?: Queryable<SystemLogDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .deleteFrom('platform_logs')
      .where('expires_at', 'is not', null)
      .where('expires_at', '<', new Date())
      .execute();
  }
}
