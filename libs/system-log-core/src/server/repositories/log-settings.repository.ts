import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { Insertable, Queryable, Selectable } from '@ikary/system-db-core';
import { SYSTEM_LOG_DATABASE } from '../log.tokens';
import type { SystemLogDatabase } from '../log.types';
import type { LogSettingsTable, SystemLogDatabaseSchema } from '../db/schema';
import type { LogLevel } from '../../shared/log-level.schema';

export type LogSettingsRow = Selectable<LogSettingsTable>;

@Injectable()
export class LogSettingsRepository {
  constructor(@Inject(SYSTEM_LOG_DATABASE) private readonly db: SystemLogDatabase) {}

  private executor(client?: Queryable<SystemLogDatabaseSchema>) {
    return (client ?? this.db.db) as Queryable<SystemLogDatabaseSchema>;
  }

  async findByScope(
    tenantId: string,
    workspaceId?: string | null,
    cellId?: string | null,
    client?: Queryable<SystemLogDatabaseSchema>,
  ): Promise<LogSettingsRow | undefined> {
    let q = this.executor(client).selectFrom('log_settings').selectAll().where('tenant_id', '=', tenantId);

    if (workspaceId != null) {
      q = q.where('workspace_id', '=', workspaceId);
    } else {
      q = q.where('workspace_id', 'is', null);
    }

    if (cellId != null) {
      q = q.where('cell_id', '=', cellId);
    } else {
      q = q.where('cell_id', 'is', null);
    }

    return q.executeTakeFirst();
  }

  async upsert(
    input: {
      tenantId: string;
      workspaceId?: string | null;
      cellId?: string | null;
      scope: 'tenant' | 'workspace' | 'cell';
      logLevel: LogLevel;
      expectedVersion: number;
    },
    client?: Queryable<SystemLogDatabaseSchema>,
  ): Promise<LogSettingsRow> {
    const existing = await this.findByScope(input.tenantId, input.workspaceId, input.cellId, client);

    if (!existing) {
      if (input.expectedVersion !== 0) {
        throw Object.assign(new Error('Version conflict: resource does not exist (expected version 0 for creation).'), {
          status: 409,
        });
      }
      return this.executor(client)
        .insertInto('log_settings')
        .values({
          id: randomUUID(),
          tenant_id: input.tenantId,
          workspace_id: input.workspaceId ?? null,
          cell_id: input.cellId ?? null,
          scope: input.scope,
          log_level: input.logLevel,
          version: 1,
        } satisfies Insertable<LogSettingsTable>)
        .returningAll()
        .executeTakeFirstOrThrow();
    }

    if (existing.version !== input.expectedVersion) {
      throw Object.assign(new Error(`Version conflict: expected ${input.expectedVersion}, got ${existing.version}.`), {
        status: 409,
      });
    }

    const result = await this.executor(client)
      .updateTable('log_settings')
      .set({
        log_level: input.logLevel,
        version: existing.version + 1,
        updated_at: new Date().toISOString() as unknown as Date,
      })
      .where('id', '=', existing.id)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new Error('Failed to update log settings.');
    }

    return result;
  }

  async cascade(
    tenantId: string,
    workspaceId?: string | null,
    cellId?: string | null,
    client?: Queryable<SystemLogDatabaseSchema>,
  ): Promise<LogLevel | null> {
    if (cellId) {
      const cellSettings = await this.findByScope(tenantId, workspaceId, cellId, client);
      if (cellSettings) return cellSettings.log_level;
    }
    if (workspaceId) {
      const wsSettings = await this.findByScope(tenantId, workspaceId, null, client);
      if (wsSettings) return wsSettings.log_level;
    }
    const tenantSettings = await this.findByScope(tenantId, null, null, client);
    return tenantSettings?.log_level ?? null;
  }
}
