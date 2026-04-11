import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../../database/database.service';
import type { AuthorizationDatabaseSchema } from '../../database/schema';
import type { RoleMemberRecord, RoleRecord } from './roles.types';

@Injectable()
export class RolesRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private executor(client?: Queryable<AuthorizationDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async upsertRole(
    input: { tenantId: string; workspaceId: string; code: string; name: string; description?: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<RoleRecord> {
    const executor = this.executor(client);
    const existing = await executor
      .selectFrom('roles')
      .select('id')
      .where('tenant_id', '=', input.tenantId)
      .where('workspace_id', '=', input.workspaceId)
      .where('code', '=', input.code)
      .executeTakeFirst();

    if (existing) {
      return executor
        .updateTable('roles')
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
      .insertInto('roles')
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

  async assignUserRole(
    input: { tenantId: string; workspaceId?: string | null; userId: string; roleId: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<void> {
    const exec = this.executor(client);
    // Use find-then-insert to handle nullable workspace_id with expression unique index
    const existing = await exec
      .selectFrom('user_roles')
      .select('id')
      .where('tenant_id', '=', input.tenantId)
      .where(sql<boolean>`workspace_id IS NOT DISTINCT FROM ${input.workspaceId ?? null}`)
      .where('user_id', '=', input.userId)
      .where('role_id', '=', input.roleId)
      .executeTakeFirst();

    if (!existing) {
      await exec
        .insertInto('user_roles')
        .values({
          tenant_id: input.tenantId,
          workspace_id: input.workspaceId ?? null,
          user_id: input.userId,
          role_id: input.roleId,
        })
        .execute();
    }
  }

  async unassignUserRole(
    input: { tenantId: string; workspaceId?: string | null; userId: string; roleId: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .deleteFrom('user_roles')
      .where('tenant_id', '=', input.tenantId)
      .where(sql<boolean>`workspace_id IS NOT DISTINCT FROM ${input.workspaceId ?? null}`)
      .where('user_id', '=', input.userId)
      .where('role_id', '=', input.roleId)
      .execute();
  }

  async findByCode(
    tenantId: string,
    workspaceId: string,
    code: string,
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<RoleRecord | undefined> {
    return this.executor(client)
      .selectFrom('roles')
      .selectAll()
      .where('tenant_id', '=', tenantId)
      .where('workspace_id', '=', workspaceId)
      .where('code', '=', code)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
  }

  async getRoleIdsForUser(
    workspaceId: string,
    userId: string,
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<string[]> {
    const rows = await this.executor(client)
      .selectFrom('user_roles as ur')
      .innerJoin('roles as r', 'r.id', 'ur.role_id')
      .select('ur.role_id')
      /* v8 ignore next 3 — Kysely expression builder callback */
      .where((eb) =>
        eb.or([eb('ur.workspace_id', '=', workspaceId), eb('ur.workspace_id', 'is', null)]),
      )
      .where('ur.user_id', '=', userId)
      .where('r.deleted_at', 'is', null)
      .execute();

    return rows.map((row) => row.role_id);
  }

  async listByWorkspace(
    tenantId: string,
    workspaceId: string,
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<RoleRecord[]> {
    const rows = await this.executor(client)
      .selectFrom('roles')
      /* v8 ignore next 2 — Kysely join builder callback */
      .leftJoin('user_roles', (join) =>
        join.onRef('user_roles.role_id', '=', 'roles.id').on('user_roles.workspace_id', '=', workspaceId),
      )
      .select([
        'roles.id',
        'roles.tenant_id',
        'roles.workspace_id',
        'roles.code',
        'roles.name',
        'roles.description',
        'roles.created_at',
        'roles.updated_at',
        'roles.deleted_at',
      ])
      .select((eb) => eb.fn.count<string>('user_roles.user_id').as('member_count'))
      .where('roles.tenant_id', '=', tenantId)
      .where('roles.workspace_id', '=', workspaceId)
      .where('roles.deleted_at', 'is', null)
      .groupBy('roles.id')
      .orderBy('roles.created_at', 'asc')
      .execute();

    return rows.map((row) => ({ ...row, member_count: Number(row.member_count ?? 0) }));
  }

  async listMembersByRole(
    input: { tenantId: string; workspaceId: string; roleId: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<RoleMemberRecord[]> {
    const rows = await this.executor(client)
      .selectFrom('user_roles as ur')
      .innerJoin('roles as r', 'r.id', 'ur.role_id')
      .innerJoin('users as u', 'u.id', 'ur.user_id')
      .select(['ur.user_id', 'u.email', 'r.code'])
      .where('ur.tenant_id', '=', input.tenantId)
      .where('ur.workspace_id', '=', input.workspaceId)
      .where('ur.role_id', '=', input.roleId)
      .where('r.deleted_at', 'is', null)
      .where('u.deleted_at', 'is', null)
      .execute();

    return rows.map((row) => ({
      userId: row.user_id,
      email: row.email,
      role_code: row.code,
    }));
  }

  async countActiveOwners(
    tenantId: string,
    workspaceId: string,
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<number> {
    // Count distinct users who hold the WORKSPACE_OWNER role in this workspace and are active workspace members
    const row = await this.executor(client)
      .selectFrom('user_roles as ur')
      .innerJoin('roles as r', 'r.id', 'ur.role_id')
      .select((eb) => eb.fn.countAll<string>().as('cnt'))
      .where('ur.tenant_id', '=', tenantId)
      .where('ur.workspace_id', '=', workspaceId)
      .where('r.code', '=', 'WORKSPACE_OWNER')
      .where('r.deleted_at', 'is', null)
      .executeTakeFirst();

    return parseInt(row?.cnt ?? '0', 10);
  }

  async softDeleteRole(
    input: { tenantId: string; workspaceId: string; roleId: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<boolean> {
    const result = await this.executor(client)
      .updateTable('roles')
      .set({ deleted_at: new Date() })
      .where('id', '=', input.roleId)
      .where('tenant_id', '=', input.tenantId)
      .where('workspace_id', '=', input.workspaceId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return (result?.numUpdatedRows ?? 0n) > 0n;
  }

  async existsInOrg(
    workspaceId: string,
    roleId: string,
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<boolean> {
    const row = await this.executor(client)
      .selectFrom('roles')
      .select('id')
      .where('workspace_id', '=', workspaceId)
      .where('id', '=', roleId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return Boolean(row);
  }
}
