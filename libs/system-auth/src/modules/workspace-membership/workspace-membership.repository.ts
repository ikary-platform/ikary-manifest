import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../../database/database.service';
import type { AuthDatabaseSchema } from '../../database/schema';
import type { TenantMemberRecord, UserWorkspaceRecord, WorkspaceMembershipRecord } from './workspace-membership.types';

@Injectable()
export class WorkspaceMembershipRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private executor(client?: Queryable<AuthDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async create(
    params: { tenantId: string; workspaceId: string; userId: string; status?: 'active' | 'invited' | 'suspended' },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<WorkspaceMembershipRecord> {
    return this.executor(client)
      .insertInto('workspace_members')
      .values({
        id: randomUUID(),
        tenant_id: params.tenantId,
        workspace_id: params.workspaceId,
        user_id: params.userId,
        status: params.status ?? 'active',
      })
      .returning(['id', 'tenant_id', 'workspace_id', 'user_id', 'status', 'role_code', 'deleted_at'])
      .executeTakeFirstOrThrow();
  }

  async findActive(
    workspaceId: string,
    userId: string,
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<WorkspaceMembershipRecord | null> {
    return (
      (await this.executor(client)
        .selectFrom('workspace_members')
        .select(['id', 'tenant_id', 'workspace_id', 'user_id', 'status', 'role_code', 'deleted_at'])
        .where('workspace_id', '=', workspaceId)
        .where('user_id', '=', userId)
        .where('status', '=', 'active')
        .where('deleted_at', 'is', null)
        .executeTakeFirst()) ?? null
    );
  }

  async listByWorkspace(workspaceId: string, tenantId: string): Promise<WorkspaceMembershipRecord[]> {
    return (await this.db.db
      .selectFrom('workspace_members as wm')
      .leftJoin('users as u', 'u.id', 'wm.user_id')
      .select([
        'wm.id',
        'wm.tenant_id',
        'wm.workspace_id',
        'wm.user_id',
        'wm.status',
        'wm.role_code',
        'wm.deleted_at',
        'u.email',
      ])
      .where('wm.workspace_id', '=', workspaceId)
      .where('wm.tenant_id', '=', tenantId)
      .where('wm.deleted_at', 'is', null)
      .orderBy('wm.id', 'asc')
      .execute()) as unknown as WorkspaceMembershipRecord[];
  }

  async findById(
    id: string,
    workspaceId: string,
    tenantId: string,
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<WorkspaceMembershipRecord | undefined> {
    return this.executor(client)
      .selectFrom('workspace_members')
      .select(['id', 'tenant_id', 'workspace_id', 'user_id', 'status', 'role_code', 'deleted_at'])
      .where('id', '=', id)
      .where('workspace_id', '=', workspaceId)
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
  }

  async update(
    id: string,
    workspaceId: string,
    tenantId: string,
    patch: { role_code?: string; status?: 'active' | 'invited' | 'suspended' },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<WorkspaceMembershipRecord> {
    return this.executor(client)
      .updateTable('workspace_members')
      .set(patch)
      .where('id', '=', id)
      .where('workspace_id', '=', workspaceId)
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', 'is', null)
      .returning(['id', 'tenant_id', 'workspace_id', 'user_id', 'status', 'role_code', 'deleted_at'])
      .executeTakeFirstOrThrow();
  }

  async softDelete(
    id: string,
    workspaceId: string,
    tenantId: string,
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .updateTable('workspace_members')
      .set({ deleted_at: this.db.now() })
      .where('id', '=', id)
      .where('workspace_id', '=', workspaceId)
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', 'is', null)
      .execute();
  }

  async listByTenant(tenantId: string): Promise<TenantMemberRecord[]> {
    return (await this.db.db
      .selectFrom('tenant_members as tm')
      .innerJoin('users as u', 'u.id', 'tm.user_id')
      .select(['tm.id', 'tm.tenant_id', 'tm.user_id', 'tm.status', 'tm.created_at', 'u.email'])
      .where('tm.tenant_id', '=', tenantId)
      .where('tm.deleted_at', 'is', null)
      .orderBy('tm.created_at', 'asc')
      .execute()) as unknown as TenantMemberRecord[];
  }

  async listActiveWorkspacesForUser(
    userId: string,
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<UserWorkspaceRecord[]> {
    return this.executor(client)
      .selectFrom('workspace_members as wm')
      .innerJoin('workspaces as w', 'w.id', 'wm.workspace_id')
      .innerJoin('tenants as t', 't.id', 'w.tenant_id')
      .select([
        'w.tenant_id',
        't.name as tenant_name',
        't.slug as tenant_slug',
        't.default_language as tenant_default_language',
        'wm.workspace_id',
        'wm.role_code',
        'w.name as workspace_name',
        'w.slug as workspace_slug',
        'w.default_language as workspace_default_language',
      ])
      .where('wm.user_id', '=', userId)
      .where('wm.status', '=', 'active')
      .where('wm.deleted_at', 'is', null)
      .where('w.deleted_at', 'is', null)
      .where('t.deleted_at', 'is', null)
      .where('t.status', '=', 'ACTIVE')
      .orderBy('w.name', 'asc')
      .execute();
  }
}
