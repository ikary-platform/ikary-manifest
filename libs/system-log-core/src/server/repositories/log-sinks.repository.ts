import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { Insertable, Queryable, Selectable } from '@ikary/system-db-core';
import { SYSTEM_LOG_DATABASE } from '../log.tokens';
import type { SystemLogDatabase } from '../log.types';
import type { LogSinksTable, SystemLogDatabaseSchema } from '../db/schema';

export type LogSinkRow = Selectable<LogSinksTable>;

export type InsertLogSinkInput = {
  tenantId: string;
  workspaceId?: string | null;
  cellId?: string | null;
  scope: 'tenant' | 'workspace' | 'cell';
  sinkType: 'ui' | 'persistent' | 'external';
  retentionHours: number;
  config: Record<string, unknown>;
};

@Injectable()
export class LogSinksRepository {
  constructor(@Inject(SYSTEM_LOG_DATABASE) private readonly db: SystemLogDatabase) {}

  private executor(client?: Queryable<SystemLogDatabaseSchema>) {
    return (client ?? this.db.db) as Queryable<SystemLogDatabaseSchema>;
  }

  async findEnabled(
    tenantId: string,
    workspaceId?: string | null,
    cellId?: string | null,
    client?: Queryable<SystemLogDatabaseSchema>,
  ): Promise<LogSinkRow[]> {
    let query = this.executor(client)
      .selectFrom('log_sinks')
      .selectAll()
      .where('tenant_id', '=', tenantId)
      .where('is_enabled', '=', 1 as unknown as boolean);

    if (workspaceId) {
      query = query.where((eb) => eb.or([eb('workspace_id', 'is', null), eb('workspace_id', '=', workspaceId)]));
    } else {
      query = query.where('workspace_id', 'is', null);
    }

    if (cellId) {
      query = query.where((eb) => eb.or([eb('cell_id', 'is', null), eb('cell_id', '=', cellId)]));
    } else {
      query = query.where('cell_id', 'is', null);
    }

    return query.execute();
  }

  async findById(
    id: string,
    tenantId: string,
    client?: Queryable<SystemLogDatabaseSchema>,
  ): Promise<LogSinkRow | undefined> {
    return this.executor(client)
      .selectFrom('log_sinks')
      .selectAll()
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .executeTakeFirst();
  }

  async insert(
    input: InsertLogSinkInput,
    client?: Queryable<SystemLogDatabaseSchema>,
  ): Promise<LogSinkRow> {
    return this.executor(client)
      .insertInto('log_sinks')
      .values({
        id: randomUUID(),
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        cell_id: input.cellId ?? null,
        scope: input.scope,
        sink_type: input.sinkType,
        retention_hours: input.retentionHours,
        config: JSON.stringify(input.config) as unknown as Record<string, unknown>,
        is_enabled: 1 as unknown as boolean,
        version: 1,
      } satisfies Insertable<LogSinksTable>)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(
    input: {
      id: string;
      tenantId: string;
      retentionHours?: number;
      config?: Record<string, unknown>;
      isEnabled?: boolean;
      expectedVersion: number;
    },
    client?: Queryable<SystemLogDatabaseSchema>,
  ): Promise<LogSinkRow> {
    const existing = await this.findById(input.id, input.tenantId);
    if (!existing) {
      throw Object.assign(new Error('Log sink not found.'), { status: 404 });
    }
    if (existing.version !== input.expectedVersion) {
      throw Object.assign(new Error(`Version conflict: expected ${input.expectedVersion}, got ${existing.version}.`), {
        status: 409,
      });
    }

    const result = await this.executor()
      .updateTable('log_sinks')
      .set({
        ...(input.retentionHours !== undefined ? { retention_hours: input.retentionHours } : {}),
        ...(input.config !== undefined ? { config: JSON.stringify(input.config) as unknown as Record<string, unknown> } : {}),
        ...(input.isEnabled !== undefined ? { is_enabled: (input.isEnabled ? 1 : 0) as unknown as boolean } : {}),
        version: existing.version + 1,
        updated_at: new Date().toISOString() as unknown as Date,
      })
      .where('id', '=', input.id)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new Error('Failed to update log sink.');
    }

    return result;
  }
}
