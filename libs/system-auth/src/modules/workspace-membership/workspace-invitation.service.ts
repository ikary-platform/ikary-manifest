import { randomBytes } from 'node:crypto';
import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AUTH_NOTIFICATION_PORT } from '../../config/constants';
import { HashService } from '../../common/hash.service';
import { AuthConfigService } from '../../config/auth-config.service';
import { DatabaseService } from '../../database/database.service';
import type { AuthNotificationPort } from '../auth/notification.port';
import { UserRepository } from '../user/user.repository';
import { WorkspaceMembershipRepository } from './workspace-membership.repository';
import { WorkspaceInvitationRepository } from './workspace-invitation.repository';

const createInvitationSchema = z.object({
  tenantId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  inviteeEmail: z
    .string()
    .trim()
    .email()
    .transform((v) => v.toLowerCase()),
  invitedRole: z.string().min(1).max(100),
  invitedByUserId: z.string().uuid(),
});

const acceptInvitationSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(1).optional(),
});

const revokeInvitationSchema = z.object({
  invitationId: z.string().uuid(),
  actorUserId: z.string().uuid(),
});

export interface CreateInvitationInput {
  tenantId: string;
  workspaceId: string;
  inviteeEmail: string;
  invitedRole: string;
  invitedByUserId: string;
}

export interface AcceptInvitationInput {
  token: string;
  password?: string;
}

export interface RevokeInvitationInput {
  invitationId: string;
  actorUserId: string;
}

@Injectable()
export class WorkspaceInvitationService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(HashService) private readonly hashService: HashService,
    @Inject(AuthConfigService) private readonly config: AuthConfigService,
    @Inject(UserRepository) private readonly users: UserRepository,
    @Inject(WorkspaceMembershipRepository) private readonly memberships: WorkspaceMembershipRepository,
    @Inject(WorkspaceInvitationRepository) private readonly invitations: WorkspaceInvitationRepository,
    @Inject(AUTH_NOTIFICATION_PORT) private readonly notificationPort: AuthNotificationPort,
  ) {}

  async createInvitation(input: CreateInvitationInput): Promise<{ invitationId: string; inviteeUserId: string }> {
    const parsed = createInvitationSchema.parse(input);

    return this.db.withTransaction(async (client) => {
      // 1. Find or create user by email
      let user = await this.users.findByEmail(parsed.inviteeEmail, client);
      if (!user || user.deleted_at) {
        // Stub user — locked with a random hash; cannot login until password is set via forgot-password flow
        const stubHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
        user = await client
          .insertInto('users')
          .values({ email: parsed.inviteeEmail, password_hash: stubHash })
          .returning([
            'id',
            'email',
            'password_hash',
            'is_email_verified',
            'is_system_admin',
            'email_verified_at',
            'last_login_at',
            'deleted_at',
            'updated_at',
          ])
          .executeTakeFirstOrThrow();
      }

      // 2. Upsert tenant_members — status=invited if new
      const existingMember = await client
        .selectFrom('tenant_members')
        .select(['id', 'status'])
        .where('tenant_id', '=', parsed.tenantId)
        .where('user_id', '=', user.id)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      let tenantMemberId: string;
      if (existingMember) {
        tenantMemberId = existingMember.id as string;
      } else {
        const tenantMember = await client
          .insertInto('tenant_members')
          .values({
            tenant_id: parsed.tenantId,
            user_id: user.id,
            status: 'invited',
            invited_by_user_id: parsed.invitedByUserId,
          })
          .returning(['id'])
          .executeTakeFirstOrThrow();
        tenantMemberId = tenantMember.id as string;
      }

      // 3. Create workspace_members (status=invited)
      const workspaceMember = await this.memberships.create(
        {
          tenantId: parsed.tenantId,
          workspaceId: parsed.workspaceId,
          userId: user.id,
          status: 'invited',
        },
        client,
      );

      // 4. Create workspace_invitations token
      const token = this.hashService.generateOpaqueToken();
      const tokenHash = this.hashService.hashOpaqueToken(token, this.config.config.jwt.tokenHashSecret);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invitation = await this.invitations.create(
        {
          tenantId: parsed.tenantId,
          workspaceId: parsed.workspaceId,
          inviteeEmail: parsed.inviteeEmail,
          inviteeUserId: user.id,
          inviteeTenantMemberId: tenantMemberId,
          invitedByUserId: parsed.invitedByUserId,
          workspaceMemberId: workspaceMember.id,
          invitedRole: parsed.invitedRole,
          tokenHash,
          expiresAt,
        },
        client,
      );

      // 5. Notify via port
      await this.notificationPort.sendWorkspaceInvitation({
        email: parsed.inviteeEmail,
        tenantId: parsed.tenantId,
        workspaceId: parsed.workspaceId,
        invitedRole: parsed.invitedRole,
        token,
        expiresAt,
      });

      return { invitationId: invitation.id, inviteeUserId: user.id };
    });
  }

  async acceptInvitation(input: AcceptInvitationInput): Promise<{
    invitedRole: string;
    userId: string;
    tenantId: string;
    workspaceId: string;
    inviteeEmail: string;
  }> {
    const parsed = acceptInvitationSchema.parse(input);
    const tokenHash = this.hashService.hashOpaqueToken(parsed.token, this.config.config.jwt.tokenHashSecret);

    return this.db.withTransaction(async (client) => {
      // 1. Validate token
      const invitation = await this.invitations.findPendingByTokenHash(tokenHash, client);
      if (!invitation || invitation.expires_at < this.db.now()) {
        throw new UnauthorizedException('Invitation token is invalid or expired.');
      }

      // 2. Set tenant_members.status = active (if was invited)
      if (invitation.invitee_tenant_member_id) {
        await client
          .updateTable('tenant_members')
          .set({ status: 'active' })
          .where('id', '=', invitation.invitee_tenant_member_id)
          .where('status', '=', 'invited')
          .execute();
      }

      // 3. Set workspace_members.status = active
      if (invitation.workspace_member_id) {
        await client
          .updateTable('workspace_members')
          .set({ status: 'active', role_code: invitation.invited_role })
          .where('id', '=', invitation.workspace_member_id)
          .execute();
      }

      // 4. Set password if provided (invited user sets their password on first accept)
      if (parsed.password && invitation.invitee_user_id) {
        const passwordHash = await this.hashService.hashPassword(parsed.password);
        await client
          .updateTable('users')
          .set({ password_hash: passwordHash, is_email_verified: this.db.bool(true) })
          .where('id', '=', invitation.invitee_user_id)
          .execute();
      }

      // 5. Mark invitation consumed
      await this.invitations.consume(invitation.id, client);

      return {
        invitedRole: invitation.invited_role ?? '',
        userId: invitation.invitee_user_id ?? '',
        tenantId: invitation.tenant_id,
        workspaceId: invitation.workspace_id,
        inviteeEmail: invitation.invitee_email,
      };
    });
  }

  async listPendingInvitations(input: {
    workspaceId: string;
    tenantId: string;
  }): Promise<ReturnType<typeof this.invitations.listPendingByWorkspace>> {
    return this.invitations.listPendingByWorkspace(input.workspaceId, input.tenantId);
  }

  async listPendingInvitationsByTenant(input: {
    tenantId: string;
  }): Promise<ReturnType<typeof this.invitations.listPendingByTenant>> {
    return this.invitations.listPendingByTenant(input.tenantId);
  }

  async resendInvitation(input: {
    invitationId: string;
    actorUserId: string;
    tenantId: string;
    workspaceId: string;
  }): Promise<{ invitationId: string; inviteeEmail: string }> {
    const existing = await this.db.db
      .selectFrom('workspace_invitations')
      .selectAll()
      .where('id', '=', input.invitationId)
      .where('tenant_id', '=', input.tenantId)
      .where('workspace_id', '=', input.workspaceId)
      .where('status', '=', 'pending')
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Invitation not found or already processed.');
    }

    return this.db.withTransaction(async (client) => {
      await this.invitations.revoke(input.invitationId, client);

      const token = this.hashService.generateOpaqueToken();
      const tokenHash = this.hashService.hashOpaqueToken(token, this.config.config.jwt.tokenHashSecret);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const newInvitation = await this.invitations.create(
        {
          tenantId: existing.tenant_id,
          workspaceId: existing.workspace_id,
          inviteeEmail: existing.invitee_email,
          inviteeUserId: existing.invitee_user_id,
          inviteeTenantMemberId: existing.invitee_tenant_member_id,
          invitedByUserId: input.actorUserId,
          workspaceMemberId: existing.workspace_member_id,
          invitedRole: existing.invited_role,
          tokenHash,
          expiresAt,
        },
        client,
      );

      await this.notificationPort.sendWorkspaceInvitation({
        email: existing.invitee_email,
        tenantId: existing.tenant_id,
        workspaceId: existing.workspace_id,
        invitedRole: existing.invited_role,
        token,
        expiresAt,
      });

      return { invitationId: newInvitation.id, inviteeEmail: existing.invitee_email };
    });
  }

  async revokeInvitation(input: RevokeInvitationInput): Promise<{ inviteeUserId: string }> {
    const parsed = revokeInvitationSchema.parse(input);

    return this.db.withTransaction(async (client) => {
      const invitation = await client
        .selectFrom('workspace_invitations')
        .selectAll()
        .where('id', '=', parsed.invitationId)
        .where('status', '=', 'pending')
        .executeTakeFirst();

      if (!invitation) {
        throw new ConflictException('Invitation not found or already processed.');
      }

      // Soft-delete workspace_members
      if (invitation.workspace_member_id) {
        await client
          .updateTable('workspace_members')
          .set({ deleted_at: this.db.now() })
          .where('id', '=', invitation.workspace_member_id)
          .execute();
      }

      // Revoke tenant_members if no other active workspace memberships in this tenant
      if (invitation.invitee_user_id) {
        const otherActiveMemberships = await client
          .selectFrom('workspace_members as wm')
          .innerJoin('workspaces as w', 'w.id', 'wm.workspace_id')
          .select('wm.id')
          .where('wm.user_id', '=', invitation.invitee_user_id)
          .where('wm.tenant_id', '=', invitation.tenant_id)
          .where('wm.status', '=', 'active')
          .where('wm.deleted_at', 'is', null)
          .limit(1)
          .execute();

        if (otherActiveMemberships.length === 0 && invitation.invitee_tenant_member_id) {
          await client
            .updateTable('tenant_members')
            .set({ status: 'revoked' })
            .where('id', '=', invitation.invitee_tenant_member_id)
            .execute();
        }
      }

      // Mark invitation revoked
      await this.invitations.revoke(parsed.invitationId, client);

      return { inviteeUserId: invitation.invitee_user_id ?? '' };
    });
  }

  async expireStaleInvitations(): Promise<number> {
    return this.invitations.expireStale();
  }
}
