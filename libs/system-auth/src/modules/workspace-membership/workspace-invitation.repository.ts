import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../../database/database.service';
import type { AuthDatabaseSchema } from '../../database/schema';

export interface WorkspaceInvitationRecord {
  id: string;
  tenant_id: string;
  workspace_id: string;
  invitee_email: string;
  invitee_user_id: string | null;
  invitee_tenant_member_id: string | null;
  invited_by_user_id: string | null;
  workspace_member_id: string | null;
  invited_role: string;
  token_hash: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
  expires_at: Date;
  consumed_at: Date | null;
  created_at: Date;
}

@Injectable()
export class WorkspaceInvitationRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private executor(client?: Queryable<AuthDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async create(
    params: {
      tenantId: string;
      workspaceId: string;
      inviteeEmail: string;
      inviteeUserId: string | null;
      inviteeTenantMemberId: string | null;
      invitedByUserId: string | null;
      workspaceMemberId: string | null;
      invitedRole: string;
      tokenHash: string;
      expiresAt: Date;
    },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<WorkspaceInvitationRecord> {
    return this.executor(client)
      .insertInto('workspace_invitations')
      .values({
        tenant_id: params.tenantId,
        workspace_id: params.workspaceId,
        invitee_email: params.inviteeEmail.toLowerCase(),
        invitee_user_id: params.inviteeUserId,
        invitee_tenant_member_id: params.inviteeTenantMemberId,
        invited_by_user_id: params.invitedByUserId,
        workspace_member_id: params.workspaceMemberId,
        invited_role: params.invitedRole,
        token_hash: params.tokenHash,
        expires_at: params.expiresAt,
      })
      .returningAll()
      .executeTakeFirstOrThrow() as unknown as Promise<WorkspaceInvitationRecord>;
  }

  async listPendingByWorkspace(workspaceId: string, tenantId: string): Promise<WorkspaceInvitationRecord[]> {
    return (await this.db.db
      .selectFrom('workspace_invitations')
      .selectAll()
      .where('workspace_id', '=', workspaceId)
      .where('tenant_id', '=', tenantId)
      .where('status', '=', 'pending')
      .orderBy('created_at', 'desc')
      .execute()) as unknown as WorkspaceInvitationRecord[];
  }

  async listPendingByTenant(tenantId: string): Promise<WorkspaceInvitationRecord[]> {
    return (await this.db.db
      .selectFrom('workspace_invitations')
      .selectAll()
      .where('tenant_id', '=', tenantId)
      .where('status', '=', 'pending')
      .orderBy('created_at', 'desc')
      .execute()) as unknown as WorkspaceInvitationRecord[];
  }

  async findPendingByTokenHash(
    tokenHash: string,
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<WorkspaceInvitationRecord | null> {
    return ((await this.executor(client)
      .selectFrom('workspace_invitations')
      .selectAll()
      .where('token_hash', '=', tokenHash)
      .where('status', '=', 'pending')
      .executeTakeFirst()) ?? null) as unknown as WorkspaceInvitationRecord | null;
  }

  async consume(id: string, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('workspace_invitations')
      .set({ status: 'accepted', consumed_at: new Date() })
      .where('id', '=', id)
      .execute();
  }

  async revoke(id: string, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('workspace_invitations')
      .set({ status: 'revoked' })
      .where('id', '=', id)
      .where('status', '=', 'pending')
      .execute();
  }

  async expireStale(client?: Queryable<AuthDatabaseSchema>): Promise<number> {
    const result = await this.executor(client)
      .updateTable('workspace_invitations')
      .set({ status: 'expired' })
      .where('status', '=', 'pending')
      .where('expires_at', '<', new Date())
      .executeTakeFirst();
    return Number(result.numUpdatedRows);
  }
}
