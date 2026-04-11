import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../../database/database.service';
import type { AuthorizationDatabaseSchema } from '../../database/schema';
import type { ScopeType, TargetType } from '../../interfaces/authorization.types';

export interface AssignmentRecord {
  id: string;
  tenant_id: string;
  workspace_id: string | null;
  cell_id: string | null;
  target_type: TargetType;
  target_id: string;
  scope_type: ScopeType;
  scope_code: string;
  access_level: number;
  created_at: Date;
}

@Injectable()
export class AssignmentsRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private executor(client?: Queryable<AuthorizationDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async upsertAssignment(
    input: {
      tenantId: string;
      workspaceId?: string | null;
      cellId?: string | null;
      targetType: TargetType;
      targetId: string;
      scopeType: ScopeType;
      scopeCode: string;
      accessLevel: number;
    },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<AssignmentRecord> {
    const exec = this.executor(client);

    // Use find-then-update-or-insert to support NULL workspace_id
    // (expression-based unique index cannot be used with Kysely's .onConflict().columns())
    const existing = await exec
      .selectFrom('permission_assignments')
      .select('id')
      .where('tenant_id', '=', input.tenantId)
      /* v8 ignore next 2 — null-coalescing in SQL template; covered by integration tests */
      .where(sql<boolean>`workspace_id IS NOT DISTINCT FROM ${input.workspaceId ?? null}`)
      .where(sql<boolean>`cell_id IS NOT DISTINCT FROM ${input.cellId ?? null}`)
      .where('target_type', '=', input.targetType)
      .where('target_id', '=', input.targetId)
      .where('scope_type', '=', input.scopeType)
      .where('scope_code', '=', input.scopeCode)
      .executeTakeFirst();

    if (existing) {
      return exec
        .updateTable('permission_assignments')
        .set({ access_level: input.accessLevel })
        .where('id', '=', existing.id)
        .returning([
          'id',
          'tenant_id',
          'workspace_id',
          'cell_id',
          'target_type',
          'target_id',
          'scope_type',
          'scope_code',
          'access_level',
          'created_at',
        ])
        .executeTakeFirstOrThrow();
    }

    return exec
      .insertInto('permission_assignments')
      .values({
        tenant_id: input.tenantId,
        /* v8 ignore next 2 */
        workspace_id: input.workspaceId ?? null,
        cell_id: input.cellId ?? null,
        target_type: input.targetType,
        target_id: input.targetId,
        scope_type: input.scopeType,
        scope_code: input.scopeCode,
        access_level: input.accessLevel,
      })
      .returning([
        'id',
        'tenant_id',
        'workspace_id',
        'cell_id',
        'target_type',
        'target_id',
        'scope_type',
        'scope_code',
        'access_level',
        'created_at',
      ])
      .executeTakeFirstOrThrow();
  }

  async findByTargets(
    input: {
      tenantId?: string;
      workspaceId: string;
      cellId?: string;
      targetType: TargetType;
      targetIds: string[];
      scopeTypes: ScopeType[];
    },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<AssignmentRecord[]> {
    if (input.targetIds.length === 0 || input.scopeTypes.length === 0) {
      return [];
    }

    let query = this.executor(client)
      .selectFrom('permission_assignments')
      .select([
        'id',
        'tenant_id',
        'workspace_id',
        'cell_id',
        'target_type',
        'target_id',
        'scope_type',
        'scope_code',
        'access_level',
        'created_at',
      ])
      .where('target_type', '=', input.targetType)
      .where('target_id', 'in', input.targetIds)
      .where('scope_type', 'in', input.scopeTypes)
      // For FEATURE: match workspace OR tenant-scope (workspace_id IS NULL)
      // For DOMAIN:  exact workspace match only (DOMAIN can never have workspace_id = NULL per DB constraint)
      /* v8 ignore next 5 — Kysely expression builder callback; covered by integration tests */
      .where((eb) =>
        eb.or([
          eb('workspace_id', '=', input.workspaceId),
          eb.and([eb('scope_type', '=', 'FEATURE'), eb('workspace_id', 'is', null)]),
        ]),
      );

    if (input.cellId) {
      // Return assignments scoped to this cell OR workspace-wide (cell_id IS NULL)
      query = query.where((eb) => eb.or([eb('cell_id', '=', input.cellId!), eb('cell_id', 'is', null)]));
    } else {
      // No cellId: only return workspace-wide assignments
      query = query.where('cell_id', 'is', null);
    }

    return query.execute();
  }

  async listByCell(
    input: { tenantId: string; workspaceId: string; cellId: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<AssignmentRecord[]> {
    return this.executor(client)
      .selectFrom('permission_assignments')
      .select([
        'id',
        'tenant_id',
        'workspace_id',
        'cell_id',
        'target_type',
        'target_id',
        'scope_type',
        'scope_code',
        'access_level',
        'created_at',
      ])
      .where('tenant_id', '=', input.tenantId)
      .where('workspace_id', '=', input.workspaceId)
      .where('cell_id', '=', input.cellId)
      .orderBy('created_at', 'asc')
      .execute();
  }

  async findTenantDomainAssignmentsForUser(
    input: { tenantId: string; userId: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<AssignmentRecord[]> {
    return this.executor(client)
      .selectFrom('permission_assignments')
      .select([
        'id',
        'tenant_id',
        'workspace_id',
        'cell_id',
        'target_type',
        'target_id',
        'scope_type',
        'scope_code',
        'access_level',
        'created_at',
      ])
      .where('tenant_id', '=', input.tenantId)
      .where('workspace_id', 'is', null)
      .where('cell_id', 'is', null)
      .where('target_type', '=', 'USER')
      .where('target_id', '=', input.userId)
      .where('scope_type', '=', 'DOMAIN')
      .orderBy('created_at', 'asc')
      .execute();
  }

  async removeAssignment(id: string, client?: Queryable<AuthorizationDatabaseSchema>): Promise<void> {
    await this.executor(client).deleteFrom('permission_assignments').where('id', '=', id).execute();
  }

  async removeAssignmentScoped(
    input: { id: string; workspaceId: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<boolean> {
    const result = await this.executor(client)
      .deleteFrom('permission_assignments')
      .where('id', '=', input.id)
      .where('workspace_id', '=', input.workspaceId)
      .executeTakeFirst();
    return Number(result.numDeletedRows) > 0;
  }

  async removeAssignmentsForTarget(
    input: { targetType: TargetType; targetId: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .deleteFrom('permission_assignments')
      .where('target_type', '=', input.targetType)
      .where('target_id', '=', input.targetId)
      .execute();
  }

  async userExists(userId: string, client?: Queryable<AuthorizationDatabaseSchema>): Promise<boolean> {
    const row = await this.executor(client)
      .selectFrom('users')
      .select('id')
      .where('id', '=', userId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return Boolean(row);
  }
}
