import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Optional,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AUTH_NOTIFICATION_PORT } from '../../config/constants';
import { AuthConfigService } from '../../config/auth-config.service';
import { HashService } from '../../common/hash.service';
import type {
  AuthContext,
  LoginResult,
  SignupResult,
  TenantIdentity,
  WorkspaceIdentity,
  WorkspaceSelectedLoginResult,
  WorkspaceSessionResult,
} from '../../common/types';
import { DatabaseService, type Queryable } from '../../database/database.service';
import type { AuthDatabaseSchema } from '../../database/schema';
import { AuthRepository } from '../../modules/auth/auth.repository';
import { SignupRequestRepository } from '../../modules/auth/signup-request.repository';
import type { AuthNotificationPort } from '../../modules/auth/notification.port';
import { TokenService } from '../../modules/auth/token.service';
import { WorkspaceMembershipService } from '../../modules/workspace-membership/workspace-membership.service';
import { WorkspaceService } from '../../modules/workspace/workspace.service';
import { UserService } from '../../modules/user/user.service';
import type { AuthProvider } from '../auth-provider.interface';
import {
  WORKSPACE_LIFECYCLE_PORT,
  type WorkspaceLifecyclePort,
} from '../../modules/workspace/workspace-lifecycle.port';
import {
  changePasswordSchema,
  completeSignupSchema,
  consumeMagicLinkSchema,
  forgotPasswordSchema,
  initiateSignupSchema,
  loginSchema,
  refreshSchema,
  requestMagicLinkSchema,
  resetPasswordSchema,
  selectWorkspaceSchema,
  signupSchema,
  switchWorkspaceSchema,
  verifyEmailSchema,
} from './classic-auth.schemas';

@Injectable()
export class ClassicAuthProvider implements AuthProvider {
  readonly provider = 'classic' as const;

  constructor(
    @Inject(AuthConfigService) private readonly configService: AuthConfigService,
    @Inject(UserService) private readonly users: UserService,
    @Inject(WorkspaceService) private readonly workspaces: WorkspaceService,
    @Inject(WorkspaceMembershipService) private readonly memberships: WorkspaceMembershipService,
    @Inject(AuthRepository) private readonly authRepository: AuthRepository,
    @Inject(SignupRequestRepository) private readonly signupRequestRepository: SignupRequestRepository,
    @Inject(HashService) private readonly hashService: HashService,
    @Inject(TokenService) private readonly tokens: TokenService,
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(AUTH_NOTIFICATION_PORT) private readonly notificationPort: AuthNotificationPort,
    @Optional() @Inject(WORKSPACE_LIFECYCLE_PORT) private readonly workspaceLifecycle?: WorkspaceLifecyclePort,
  ) {}

  async signup(input: unknown, context: AuthContext): Promise<SignupResult> {
    this.assertEnabled();
    const payload = signupSchema.parse(input);
    this.assertPasswordPolicy(payload.password);

    // Transaction 1: create user, tenant, and workspace atomically
    const { user, tenant, workspace } = await this.db.withTransaction(async (client) => {
      const existingUser = await this.users.findByEmail(payload.email, client);
      if (existingUser && !existingUser.deleted_at) {
        throw new ConflictException('Email already exists.');
      }

      const passwordHash = await this.hashService.hashPassword(payload.password);
      const user = await this.users.create(payload.email, passwordHash, client);
      const tenant = await this.createTenantForUser(
        {
          name: payload.workspaceName,
          slug: payload.workspaceSlug ?? this.toSlug(payload.workspaceName),
          createdByUserId: user.id,
        },
        client,
      );

      await this.ensureTenantMembership(tenant.id, user.id, client);

      const workspace = await this.workspaces.createWorkspace(
        {
          tenantId: tenant.id,
          name: payload.workspaceName,
          slug: payload.workspaceSlug ?? this.toSlug(payload.workspaceName),
          createdByUserId: user.id,
        },
        client,
      );

      await this.memberships.createMembership(
        {
          tenantId: tenant.id,
          workspaceId: workspace.id,
          userId: user.id,
        },
        client,
      );

      return { user, tenant, workspace };
    });

    // After commit: seed roles and permissions via AuthorizationService (uses its own DB connection
    // and cannot participate in the transaction above — workspace must be committed first)
    await this.workspaceLifecycle?.onWorkspaceCreated({
      tenantId: tenant.id,
      workspaceId: workspace.id,
      createdByUserId: user.id,
    });

    const requiresEmailVerification = this.configService.config.classic.requireEmailVerification;
    if (requiresEmailVerification) {
      await this.dispatchEmailVerification({
        tenantId: tenant.id,
        workspaceId: workspace.id,
        userId: user.id,
        email: user.email,
      });

      return {
        userId: user.id,
        tenantId: tenant.id,
        workspaceId: workspace.id,
        requiresEmailVerification: true,
      };
    }

    const auth = await this.issueWorkspaceSession({
      userId: user.id,
      workspaceId: workspace.id,
      context,
    });

    return {
      userId: user.id,
      tenantId: tenant.id,
      workspaceId: workspace.id,
      requiresEmailVerification: false,
      tokens: auth.tokens,
    };
  }

  async login(input: unknown, context: AuthContext): Promise<LoginResult> {
    this.assertEnabled();
    const payload = loginSchema.parse(input);

    const user = await this.users.findByEmail(payload.email);
    if (!user || user.deleted_at) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordOk = await this.hashService.verifyPassword(payload.password, user.password_hash);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    let workspaces = await this.listWorkspaceIdentities(user.id);
    if (workspaces.length === 0) {
      throw new UnauthorizedException('User does not have an active workspace membership.');
    }

    // If tenantSlug is provided, filter workspaces to that tenant and enforce user_login_enabled
    if (payload.tenantSlug && !user.is_system_admin) {
      const tenant = await this.db.db
        .selectFrom('tenants')
        .select(['id', 'user_login_enabled'])
        .where('slug', 'like', payload.tenantSlug)
        .where('deleted_at', 'is', null)
        .where('status', '=', 'ACTIVE')
        .executeTakeFirst();

      if (!tenant) {
        throw new UnauthorizedException('Invalid credentials.');
      }

      if (!tenant.user_login_enabled) {
        throw new ForbiddenException('User login is not enabled for this tenant.');
      }

      workspaces = workspaces.filter((w) => w.tenantId === tenant.id);
      if (workspaces.length === 0) {
        throw new UnauthorizedException('User does not have an active workspace membership.');
      }
    }

    if (this.configService.config.classic.requireEmailVerification && !user.is_email_verified) {
      if (workspaces.length === 1) {
        await this.dispatchEmailVerification({
          tenantId: workspaces[0].tenantId,
          workspaceId: workspaces[0].id,
          userId: user.id,
          email: user.email,
        });
      }

      throw new ForbiddenException('Email verification required before login.');
    }

    await this.users.updateLastLogin(user.id);

    if (workspaces.length === 1) {
      const session = await this.issueWorkspaceSession({
        userId: user.id,
        workspaceId: workspaces[0].id,
        context,
      });
      return {
        nextStep: 'WORKSPACE_SELECTED',
        ...session,
      } satisfies WorkspaceSelectedLoginResult;
    }

    return {
      nextStep: 'SELECT_WORKSPACE',
      userId: user.id,
      workspaces,
      selectionToken: this.tokens.createWorkspaceSelectionToken({ userId: user.id }),
    };
  }

  async refresh(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult> {
    this.assertEnabled();
    const payload = refreshSchema.parse(input);
    const refreshPayload = this.tokens.verifyRefreshToken(payload.refreshToken);

    return this.db.withTransaction(async (client) => {
      const stored = await this.authRepository.findActiveRefreshToken(
        {
          jti: refreshPayload.jti,
          tenantId: refreshPayload.tenant_id,
          workspaceId: refreshPayload.workspace_id,
          userId: refreshPayload.user_id,
        },
        client,
      );

      if (!stored || stored.revoked_at || stored.expires_at < this.db.now()) {
        throw new UnauthorizedException('Refresh token is invalid.');
      }

      const hash = this.hashService.hashOpaqueToken(
        payload.refreshToken,
        this.configService.config.jwt.tokenHashSecret,
      );
      if (stored.token_hash !== hash) {
        throw new UnauthorizedException('Refresh token is invalid.');
      }

      await this.memberships.getRequiredActiveMembership(refreshPayload.workspace_id, refreshPayload.user_id, client);
      await this.getRequiredActiveTenant(refreshPayload.tenant_id, client);
      await this.authRepository.revokeRefreshToken(
        {
          tokenId: stored.id,
        },
        client,
      );

      return this.issueWorkspaceSession(
        {
          userId: refreshPayload.user_id,
          workspaceId: refreshPayload.workspace_id,
          context,
        },
        client,
      );
    });
  }

  async issueSessionFromSso(
    claims: { userId: string; workspaceId: string },
    context: AuthContext,
  ): Promise<WorkspaceSessionResult> {
    return this.issueWorkspaceSession({ userId: claims.userId, workspaceId: claims.workspaceId, context });
  }

  async selectWorkspace(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult> {
    const payload = selectWorkspaceSchema.parse(input);
    const token = this.tokens.verifyWorkspaceSelectionToken(payload.selectionToken);
    return this.issueWorkspaceSession({
      userId: token.user_id,
      workspaceId: payload.workspaceId,
      context,
    });
  }

  async switchWorkspace(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult> {
    const payload = switchWorkspaceSchema.parse(input);
    if (!context.userId) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    return this.issueWorkspaceSession({
      userId: context.userId,
      workspaceId: payload.workspaceId,
      context,
    });
  }

  async forgotPassword(input: unknown, _context: AuthContext): Promise<void> {
    this.assertEnabled();
    const payload = forgotPasswordSchema.parse(input);

    const user = await this.users.findByEmail(payload.email);
    if (!user || user.deleted_at) {
      return;
    }

    let workspaceId: string;
    let tenantId: string;

    if (payload.workspaceId) {
      const membership = await this.memberships
        .getRequiredActiveMembership(payload.workspaceId, user.id)
        .catch(() => null);
      if (!membership) {
        return;
      }
      workspaceId = payload.workspaceId;
      const workspace = await this.workspaces.getRequired(workspaceId);
      tenantId = workspace.tenant_id;
    } else {
      const workspaces = await this.memberships.listActiveWorkspacesForUser(user.id);
      if (workspaces.length === 0) {
        return;
      }
      workspaceId = workspaces[0].workspace_id;
      tenantId = workspaces[0].tenant_id;
    }

    await this.db.withTransaction(async (client) => {
      const token = this.hashService.generateOpaqueToken();
      const tokenHash = this.hashService.hashOpaqueToken(token, this.configService.config.jwt.tokenHashSecret);
      const expiresAt = this.addMinutes(this.configService.config.classic.resetPasswordTtlMinutes);

      await this.authRepository.invalidatePasswordResetTokens(
        {
          workspaceId,
          userId: user.id,
        },
        client,
      );

      await this.authRepository.createPasswordResetToken(
        {
          tenantId,
          workspaceId,
          userId: user.id,
          tokenHash,
          expiresAt,
        },
        client,
      );

      await this.notificationPort.sendPasswordReset({
        email: user.email,
        workspaceId,
        token,
        expiresAt,
      });
    });
  }

  async resetPassword(input: unknown, _context: AuthContext): Promise<void> {
    this.assertEnabled();
    const payload = resetPasswordSchema.parse(input);
    this.assertPasswordPolicy(payload.newPassword);

    const tokenHash = this.hashService.hashOpaqueToken(payload.token, this.configService.config.jwt.tokenHashSecret);
    const token = await this.authRepository.findActivePasswordResetTokenByHash({
      workspaceId: payload.workspaceId,
      tokenHash,
    });

    if (!token || token.expires_at < this.db.now()) {
      throw new UnauthorizedException('Reset token is invalid or expired.');
    }

    const workspaceId = payload.workspaceId ?? token.workspace_id;

    await this.db.withTransaction(async (client) => {
      const passwordHash = await this.hashService.hashPassword(payload.newPassword);
      await this.users.updatePassword(token.user_id, passwordHash, client);
      await this.authRepository.consumePasswordResetToken(token.id, client);
      const workspace = await this.workspaces.getRequired(workspaceId, client);
      await this.authRepository.revokeUserRefreshTokens(
        {
          tenantId: workspace.tenant_id,
          workspaceId,
          userId: token.user_id,
        },
        client,
      );
    });
  }

  async changePassword(input: unknown, context: AuthContext): Promise<void> {
    this.assertEnabled();
    const payload = changePasswordSchema.parse(input);
    this.assertPasswordPolicy(payload.newPassword);

    if (!context.userId) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    const user = await this.users.findById(context.userId);
    if (!user || user.deleted_at) {
      throw new UnauthorizedException('User not found.');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Password change is not available for OAuth-only accounts.');
    }

    const passwordOk = await this.hashService.verifyPassword(payload.currentPassword, user.password_hash);
    if (!passwordOk) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const passwordHash = await this.hashService.hashPassword(payload.newPassword);
    await this.users.updatePassword(user.id, passwordHash);

    void this.notificationPort.sendPasswordChanged({ email: user.email }).catch(() => undefined);
  }

  async verifyEmail(input: unknown, _context: AuthContext): Promise<void> {
    this.assertEnabled();
    const payload = verifyEmailSchema.parse(input);
    const strategy = this.configService.config.classic.emailVerification;

    if (strategy === 'code' && !payload.code) {
      throw new UnprocessableEntityException('Verification code is required.');
    }

    if (strategy === 'click' && !payload.token) {
      throw new UnprocessableEntityException('Verification token is required.');
    }

    const user = await this.users.findByEmail(payload.email);
    if (!user || user.deleted_at) {
      throw new UnauthorizedException('User not found.');
    }

    await this.memberships.getRequiredActiveMembership(payload.workspaceId, user.id);

    const token = await this.authRepository.findActiveEmailVerificationTokenByHash({
      workspaceId: payload.workspaceId,
      userId: user.id,
      strategy,
      codeHash: payload.code
        ? this.hashService.hashOpaqueToken(payload.code, this.configService.config.jwt.tokenHashSecret)
        : undefined,
      tokenHash: payload.token
        ? this.hashService.hashOpaqueToken(payload.token, this.configService.config.jwt.tokenHashSecret)
        : undefined,
    });

    if (!token || token.expires_at < this.db.now()) {
      throw new UnauthorizedException('Verification token is invalid or expired.');
    }

    await this.db.withTransaction(async (client) => {
      await this.authRepository.consumeEmailVerificationToken(token.id, client);
      await this.users.markEmailVerified(user.id, client);
    });
  }

  async requestMagicLink(input: unknown, _context: AuthContext): Promise<void> {
    this.assertEnabled();
    this.assertMagicLinkEnabled();
    const payload = requestMagicLinkSchema.parse(input);

    const user = await this.users.findByEmail(payload.email);
    if (!user || user.deleted_at) {
      return;
    }

    const membership = await this.memberships
      .getRequiredActiveMembership(payload.workspaceId, user.id)
      .catch(() => null);
    if (!membership) {
      return;
    }

    const workspace = await this.workspaces.getRequired(payload.workspaceId);

    await this.db.withTransaction(async (client) => {
      const token = this.hashService.generateOpaqueToken();
      const tokenHash = this.hashService.hashOpaqueToken(token, this.configService.config.jwt.tokenHashSecret);
      const expiresAt = this.addMinutes(this.configService.config.classic.magicLinkTtlMinutes);

      await this.authRepository.invalidateMagicLinkTokens(
        {
          workspaceId: payload.workspaceId,
          userId: user.id,
        },
        client,
      );

      await this.authRepository.createMagicLinkToken(
        {
          tenantId: workspace.tenant_id,
          workspaceId: payload.workspaceId,
          userId: user.id,
          tokenHash,
          expiresAt,
        },
        client,
      );

      await this.notificationPort.sendMagicLink({
        email: user.email,
        workspaceId: payload.workspaceId,
        token,
        expiresAt,
      });
    });
  }

  async consumeMagicLink(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult> {
    this.assertEnabled();
    this.assertMagicLinkEnabled();
    const payload = consumeMagicLinkSchema.parse(input);

    const tokenHash = this.hashService.hashOpaqueToken(payload.token, this.configService.config.jwt.tokenHashSecret);
    const token = await this.authRepository.findActiveMagicLinkTokenByHash({
      workspaceId: payload.workspaceId,
      tokenHash,
    });

    if (!token || token.expires_at < this.db.now()) {
      throw new UnauthorizedException('Magic link is invalid or expired.');
    }

    return this.db.withTransaction(async (client) => {
      const user = await this.users.findById(token.user_id, client);
      if (!user || user.deleted_at) {
        throw new UnauthorizedException('User not found.');
      }

      await this.authRepository.consumeMagicLinkToken(token.id, client);

      if (this.configService.config.classic.requireEmailVerification && !user.is_email_verified) {
        await this.users.markEmailVerified(user.id, client);
      }

      await this.memberships.getRequiredActiveMembership(payload.workspaceId, user.id, client);

      return this.issueWorkspaceSession(
        {
          userId: user.id,
          workspaceId: payload.workspaceId,
          context,
        },
        client,
      );
    });
  }

  async initiateSignup(input: unknown): Promise<{ sent: boolean }> {
    this.assertEnabled();
    const payload = initiateSignupSchema.parse(input);

    const existingUser = await this.users.findByEmail(payload.email);
    if (existingUser && !existingUser.deleted_at) {
      return { sent: true };
    }

    const code = this.hashService.generateNumericCode(6);
    const codeHash = this.hashService.hashOpaqueToken(code, this.configService.config.jwt.tokenHashSecret);
    const expiresAt = this.addMinutes(15);

    await this.signupRequestRepository.invalidateForEmail(payload.email);
    await this.signupRequestRepository.create(payload.email, codeHash, expiresAt);
    await this.notificationPort.sendSignupInvitation({ email: payload.email, code, expiresAt });

    return { sent: true };
  }

  async completeSignup(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult> {
    this.assertEnabled();
    const payload = completeSignupSchema.parse(input);
    this.assertPasswordPolicy(payload.password);

    const codeHash = this.hashService.hashOpaqueToken(payload.code, this.configService.config.jwt.tokenHashSecret);
    const request = await this.signupRequestRepository.findActiveByEmailAndCodeHash(payload.email, codeHash);
    if (!request) {
      throw new UnauthorizedException('Invalid or expired code.');
    }

    // Transaction 1: create user, tenant, and workspace atomically
    const { user, tenant, workspace } = await this.db.withTransaction(async (client) => {
      const existingUser = await this.users.findByEmail(payload.email, client);
      if (existingUser && !existingUser.deleted_at) {
        throw new ConflictException('Email already exists.');
      }

      const passwordHash = await this.hashService.hashPassword(payload.password);
      const user = await this.users.create(payload.email, passwordHash, client);
      await this.users.markEmailVerified(user.id, client);

      const tenantSlug = payload.workspaceSlug ?? this.toSlug(payload.email.split('@')[0]);
      const tenant = await this.createTenantForUser(
        {
          name: tenantSlug,
          slug: tenantSlug,
          createdByUserId: user.id,
        },
        client,
      );

      await this.ensureTenantMembership(tenant.id, user.id, client);

      const workspaceSlug = payload.workspaceSlug ?? this.toSlug('default-workspace');
      const workspace = await this.workspaces.createWorkspace(
        {
          tenantId: tenant.id,
          name: 'Default Workspace',
          slug: workspaceSlug,
          createdByUserId: user.id,
        },
        client,
      );

      await this.memberships.createMembership(
        {
          tenantId: tenant.id,
          workspaceId: workspace.id,
          userId: user.id,
        },
        client,
      );

      await this.signupRequestRepository.consume(request.id, client);

      return { user, tenant, workspace };
    });

    // After commit: seed roles and permissions via AuthorizationService (uses its own DB connection
    // and cannot participate in the transaction above — workspace must be committed first)
    await this.workspaceLifecycle?.onWorkspaceCreated({
      tenantId: tenant.id,
      workspaceId: workspace.id,
      createdByUserId: user.id,
    });

    return this.issueWorkspaceSession({ userId: user.id, workspaceId: workspace.id, context });
  }

  private async dispatchEmailVerification(
    input: { tenantId: string; workspaceId: string; userId: string; email: string },
    client?: Queryable,
  ): Promise<void> {
    const strategy = this.configService.config.classic.emailVerification;
    const expiresAt = this.addMinutes(this.configService.config.classic.verificationTokenTtlMinutes);

    await this.authRepository.invalidateEmailVerificationTokens(
      {
        workspaceId: input.workspaceId,
        userId: input.userId,
      },
      client,
    );

    if (strategy === 'code') {
      const code = this.hashService.generateNumericCode(this.configService.config.classic.verificationCodeLength);
      const codeHash = this.hashService.hashOpaqueToken(code, this.configService.config.jwt.tokenHashSecret);

      await this.authRepository.createEmailVerificationToken(
        {
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          userId: input.userId,
          strategy,
          codeHash,
          expiresAt,
        },
        client,
      );

      await this.notificationPort.sendEmailVerification({
        email: input.email,
        workspaceId: input.workspaceId,
        strategy,
        code,
        expiresAt,
      });

      return;
    }

    const token = this.hashService.generateOpaqueToken();
    const tokenHash = this.hashService.hashOpaqueToken(token, this.configService.config.jwt.tokenHashSecret);

    await this.authRepository.createEmailVerificationToken(
      {
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        userId: input.userId,
        strategy,
        tokenHash,
        expiresAt,
      },
      client,
    );

    await this.notificationPort.sendEmailVerification({
      email: input.email,
      workspaceId: input.workspaceId,
      strategy,
      token,
      expiresAt,
    });
  }

  private async issueWorkspaceSession(
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

  private async listWorkspaceIdentities(userId: string, client?: Queryable): Promise<WorkspaceIdentity[]> {
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

  private async createTenantForUser(
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

  private async ensureTenantMembership(tenantId: string, userId: string, client: Queryable): Promise<void> {
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

  private async getTenantIdentity(tenantId: string, client?: Queryable): Promise<TenantIdentity> {
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

  private async getRequiredActiveTenant(tenantId: string, client?: Queryable): Promise<void> {
    await this.getTenantIdentity(tenantId, client);
  }

  private assertEnabled(): void {
    if (!this.configService.config.classic.enabled) {
      throw new ForbiddenException('Classic auth provider is disabled.');
    }
  }

  private assertMagicLinkEnabled(): void {
    if (!this.configService.config.classic.magicLink) {
      throw new ForbiddenException('Magic link is disabled for classic auth.');
    }
  }

  private assertPasswordPolicy(password: string): void {
    if (password.length < this.configService.config.classic.passwordMinLength) {
      throw new UnprocessableEntityException(
        `Password must be at least ${this.configService.config.classic.passwordMinLength} characters.`,
      );
    }
  }

  private addMinutes(minutes: number): Date {
    return new Date(Date.now() + minutes * 60_000);
  }

  private toSlug(name: string): string {
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
