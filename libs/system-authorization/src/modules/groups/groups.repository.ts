import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../../database/database.service';
import type { AuthorizationDatabaseSchema } from '../../database/schema';
import type { GroupRecord } from './groups.types';

@Injectable()
export class GroupsRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private executor(client?: Queryable<AuthorizationDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async upsertGroup(
    input: { tenantId: string; workspaceId: string; code: string; name: string; description?: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<GroupRecord> {
    const executor = this.executor(client);
    const existing = await executor
      .selectFrom('groups')
      .select('id')
      .where('workspace_id', '=', input.workspaceId)
      .where('code', '=', input.code)
      .executeTakeFirst();

    if (existing) {
      return executor
        .updateTable('groups')
        .set({
          tenant_id: input.tenantId,
          name: input.name,
          description: input.description ?? null,
          deleted_at: null,
          updated_at: new Date(),
        })
        .where('id', '=', existing.id)
        .returning([
          'id',
          'tenant_id',
          'workspace_id',
          'code',
          'name',
          'description',
          'created_at',
          'updated_at',
          'deleted_at',
        ])
        .executeTakeFirstOrThrow();
    }

    return executor
      .insertInto('groups')
      .values({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        code: input.code,
        name: input.name,
        description: input.description ?? null,
      })
      .returning([
        'id',
        'tenant_id',
        'workspace_id',
        'code',
        'name',
        'description',
        'created_at',
        'updated_at',
        'deleted_at',
      ])
      .executeTakeFirstOrThrow();
  }

  async assignUserGroup(
    input: { tenantId: string; workspaceId: string; userId: string; groupId: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .insertInto('user_groups')
      .values({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        user_id: input.userId,
        group_id: input.groupId,
      })
      .onConflict((oc) => oc.columns(['workspace_id', 'user_id', 'group_id']).doNothing())
      .execute();
  }

  async getGroupIdsForUser(
    workspaceId: string,
    userId: string,
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<string[]> {
    const rows = await this.executor(client)
      .selectFrom('user_groups as ug')
      /* v8 ignore next 2 — Kysely join builder callback */
      .innerJoin('groups as g', (join) =>
        join.onRef('g.id', '=', 'ug.group_id').onRef('g.workspace_id', '=', 'ug.workspace_id'),
      )
      .select('ug.group_id')
      .where('ug.workspace_id', '=', workspaceId)
      .where('ug.user_id', '=', userId)
      .where('g.deleted_at', 'is', null)
      .execute();

    return rows.map((row) => row.group_id);
  }

  async existsInOrg(
    workspaceId: string,
    groupId: string,
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<boolean> {
    const row = await this.executor(client)
      .selectFrom('groups')
      .select('id')
      .where('workspace_id', '=', workspaceId)
      .where('id', '=', groupId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return Boolean(row);
  }
}
