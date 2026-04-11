import { ForbiddenException, Inject, Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { AuthConfigService } from '../../config/auth-config.service';
import { HashService } from '../../common/hash.service';
import type { AuthContext, TenantIdentity, WorkspaceIdentity, WorkspaceSessionResult } from '../../common/types';
import { DatabaseService, type Queryable } from '../../database/database.service';
import { AuthRepository } from './auth.repository';
import { TokenService } from './token.service';
import { WorkspaceMembershipService } from '../workspace-membership/workspace-membership.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { UserService } from '../user/user.service';
import { WORKSPACE_LIFECYCLE_PORT, type WorkspaceLifecyclePort } from '../workspace/workspace-lifecycle.port';

@Injectable()
export class AuthSessionService {
  constructor(
    @Inject(AuthConfigService) private readonly configService: AuthConfigService,
    @Inject(UserService) private readonly users: UserService,
    @Inject(WorkspaceService) private readonly workspaces: WorkspaceService,
    @Inject(WorkspaceMembershipService) private readonly memberships: WorkspaceMembershipService,
    @Inject(AuthRepository) private readonly authRepository: AuthRepository,
    @Inject(HashService) private readonly hashService: HashService,
    @Inject(TokenService) private readonly tokens: TokenService,
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Optional() @Inject(WORKSPACE_LIFECYCLE_PORT) private readonly workspaceLifecycle?: WorkspaceLifecyclePort,
  ) {}

  async issueWorkspaceSession(
    input: {
      userId: string;
      workspaceId: string;
      context: AuthContext;
    },
    client?: Queryable,
  ): Promise<WorkspaceSessionResult> {
    await this.memberships.getRequiredActiveMembership(input.workspaceId, input.userId, client);
    const workspaces = await this.listWorkspaceIdentities(input.userId, client);
    const workspace = workspaces.find((item) => item.id === input.workspaceId);
    if (!workspace) {
      throw new UnauthorizedException('User does not have an active workspace membership.');
    }
    const tenant = await this.getTenantIdentity(workspace.tenantId, client);

    const user = await this.users.findById(input.userId, client);
    if (!user || user.deleted_at) {
      throw new UnauthorizedException('User not found.');
    }

    const pair = this.tokens.createTokenPair({
      userId: input.userId,
      tenantId: workspace.tenantId,
      workspaceId: input.workspaceId,
      isSystemAdmin: user.is_system_admin,
    });

    const refreshHash = this.hashService.hashOpaqueToken(
      pair.refreshToken,
      this.configService.config.jwt.tokenHashSecret,
    );
    await this.authRepository.storeRefreshToken(
      {
        jti: pair.refreshJti,
        tenantId: workspace.tenantId,
        workspaceId: input.workspaceId,
        userId: input.userId,
        tokenHash: refreshHash,
        expiresAt: pair.refreshTokenExpiresAt,
        ipAddress: input.context.ipAddress,
        userAgent: input.context.userAgent,
      },
      client,
    );

    return {
      userId: input.userId,
      user: {
        id: user.id,
        email: user.email,
        isSystemAdmin: user.is_system_admin,
        preferredLanguage: user.preferred_language ?? null,
      },
      tenant,
      workspace,
      workspaces,
      tokens: {
        accessToken: pair.accessToken,
        refreshToken: pair.refreshToken,
        accessTokenExpiresAt: pair.accessTokenExpiresAt,
        refreshTokenExpiresAt: pair.refreshTokenExpiresAt,
      },
    };
  }

  async listWorkspaceIdentities(userId: string, client?: Queryable): Promise<WorkspaceIdentity[]> {
    const rows = await this.memberships.listActiveWorkspacesForUser(userId, client);
    return rows.map((row) => ({
      id: row.workspace_id,
      tenantId: row.tenant_id,
      tenantName: row.tenant_name,
      tenantSlug: row.tenant_slug,
      slug: row.workspace_slug,
      name: row.workspace_name,
      roleCode: row.role_code ?? undefined,
      defaultLanguage: row.workspace_default_language ?? row.tenant_default_language ?? undefined,
    }));
  }

  async createTenantForUser(
    input: { name: string; slug: string; createdByUserId: string },
    client: Queryable,
  ): Promise<TenantIdentity> {
    return client
      .insertInto('tenants')
      .values({
        name: input.name,
        slug: input.slug,
        status: 'ACTIVE',
        default_language: 'en',
        created_by: input.createdByUserId,
        updated_by: input.createdByUserId,
      })
      .returning(['id', 'name', 'slug'])
      .executeTakeFirstOrThrow();
  }

  async ensureTenantMembership(tenantId: string, userId: string, client: Queryable): Promise<void> {
    await client
      .insertInto('tenant_members')
      .values({
        tenant_id: tenantId,
        user_id: userId,
        status: 'active',
      })
      .onConflict((oc: any) => oc.columns(['tenant_id', 'user_id']).doNothing())
      .execute();
  }

  async createTenantAndWorkspace(
    input: {
      userId: string;
      workspaceName: string;
      workspaceSlug: string;
    },
    client: Queryable,
  ): Promise<{ tenantId: string; workspaceId: string }> {
    const tenant = await this.createTenantForUser(
      {
        name: input.workspaceName,
        slug: input.workspaceSlug,
        createdByUserId: input.userId,
      },
      client,
    );

    await this.ensureTenantMembership(tenant.id, input.userId, client);

    const workspace = await this.workspaces.createWorkspace(
      {
        tenantId: tenant.id,
        name: input.workspaceName,
        slug: input.workspaceSlug,
        createdByUserId: input.userId,
      },
      client,
    );

    await this.memberships.createMembership(
      {
        tenantId: tenant.id,
        workspaceId: workspace.id,
        userId: input.userId,
      },
      client,
    );

    return { tenantId: tenant.id, workspaceId: workspace.id };
  }

  async onWorkspaceCreated(input: { tenantId: string; workspaceId: string; createdByUserId: string }): Promise<void> {
    await this.workspaceLifecycle?.onWorkspaceCreated(input);
  }

  get database(): DatabaseService {
    return this.db;
  }

  async getTenantIdentity(tenantId: string, client?: Queryable): Promise<TenantIdentity> {
    const tenant = await (client ?? this.db.db)
      .selectFrom('tenants')
      .select(['id', 'name', 'slug', 'status', 'default_language'])
      .where('id', '=', tenantId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!tenant) {
      throw new UnauthorizedException('Workspace tenant was not found.');
    }

    if (tenant.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'TENANT_DISABLED',
        message: 'This tenant is disabled.',
      });
    }

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      defaultLanguage: tenant.default_language,
    };
  }

  toSlug(name: string): string {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 120);

    if (slug.length >= 3) {
      return slug;
    }

    return `workspace-${Date.now().toString(36)}`.slice(0, 120);
  }
}
