import { ForbiddenException, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import type {
  AuthContext,
  LoginResult,
  ProviderName,
  SignupResult,
  WorkspaceSelectedLoginResult,
  WorkspaceSessionResult,
} from '../../common/types';
import type { AuthProvider } from '../auth-provider.interface';
import type { AuthSessionService } from '../../modules/auth/auth-session.service';
import type { OAuthRepository } from '../../modules/auth/oauth.repository';
import type { UserService } from '../../modules/user/user.service';
import type { TokenService } from '../../modules/auth/token.service';
import type { OAuthProviderConfig } from '../../config/auth-options.schema';

export interface OAuthUserProfile {
  providerUserId: string;
  email: string;
  isEmailVerified: boolean;
  displayName?: string;
  avatarUrl?: string;
}

export abstract class OAuthBaseProvider implements AuthProvider {
  abstract readonly provider: ProviderName;

  constructor(
    protected readonly oauthRepository: OAuthRepository,
    protected readonly sessionService: AuthSessionService,
    protected readonly userService: UserService,
    protected readonly tokenService: TokenService,
    protected readonly providerConfig: OAuthProviderConfig,
  ) {}

  protected abstract get providerName(): 'github' | 'google';

  async signup(_input: unknown, _context: AuthContext): Promise<SignupResult> {
    throw new NotImplementedException('OAuth signup is handled via the callback flow.');
  }

  async login(_input: unknown, _context: AuthContext): Promise<LoginResult> {
    throw new NotImplementedException('OAuth login is handled via the callback flow.');
  }

  async refresh(_input: unknown, _context: AuthContext): Promise<WorkspaceSessionResult> {
    throw new NotImplementedException('Use the classic provider for token refresh.');
  }

  async forgotPassword(_input: unknown, _context: AuthContext): Promise<void> {
    throw new NotImplementedException('Password reset is not available for OAuth providers.');
  }

  async resetPassword(_input: unknown, _context: AuthContext): Promise<void> {
    throw new NotImplementedException('Password reset is not available for OAuth providers.');
  }

  async verifyEmail(_input: unknown, _context: AuthContext): Promise<void> {
    throw new NotImplementedException('Email verification is not available for OAuth providers.');
  }

  async handleCallback(input: { code: string; state: string }, context: AuthContext): Promise<LoginResult> {
    // 1. Validate state token (CSRF)
    const stateToken = await this.oauthRepository.findActiveStateToken(input.state, this.providerName);
    if (!stateToken) {
      throw new UnauthorizedException('Invalid or expired OAuth state token.');
    }
    await this.oauthRepository.consumeStateToken(stateToken.id);

    // 2. Exchange code for access token + fetch user profile (delegated to subclass)
    const profile = await this.exchangeAndFetchProfile(input.code, stateToken.code_verifier ?? undefined);

    if (!profile.email) {
      throw new UnauthorizedException('OAuth provider did not return an email address.');
    }

    if (!profile.isEmailVerified) {
      throw new ForbiddenException('OAuth email address is not verified by the provider.');
    }

    // 3. Resolve user: lookup by OAuth account, then by email, then create
    const existingOAuthAccount = await this.oauthRepository.findOAuthAccount(this.providerName, profile.providerUserId);

    if (existingOAuthAccount) {
      return this.loginExistingUser(existingOAuthAccount.user_id, context);
    }

    // Check for existing user with matching email (auto-link)
    const existingUser = await this.userService.findByEmail(profile.email);
    if (existingUser && !existingUser.deleted_at) {
      if (!this.providerConfig.autoLinkByEmail) {
        throw new ForbiddenException(
          'An account with this email already exists. Sign in with your existing credentials to link this provider.',
        );
      }

      await this.oauthRepository.createOAuthAccount({
        userId: existingUser.id,
        provider: this.providerName,
        providerUserId: profile.providerUserId,
        providerEmail: profile.email,
        providerDisplayName: profile.displayName,
        providerAvatarUrl: profile.avatarUrl,
      });

      return this.loginExistingUser(existingUser.id, context);
    }

    // SIGNUP: create new user, tenant, workspace
    if (!this.providerConfig.allowSignup) {
      throw new ForbiddenException('Signup via this OAuth provider is disabled.');
    }

    const metadata = stateToken.metadata as {
      signupIntent?: { workspaceName?: string; workspaceSlug?: string };
    } | null;
    const workspaceName = metadata?.signupIntent?.workspaceName ?? profile.email.split('@')[0];
    const workspaceSlug = metadata?.signupIntent?.workspaceSlug ?? this.sessionService.toSlug(workspaceName);

    const db = this.sessionService.database;
    const { userId, workspaceId, tenantId } = await db.withTransaction(async (client) => {
      const user = await this.userService.create(profile.email, null as any, client);
      await this.userService.markEmailVerified(user.id, client);

      const result = await this.sessionService.createTenantAndWorkspace(
        { userId: user.id, workspaceName, workspaceSlug },
        client,
      );

      await this.oauthRepository.createOAuthAccount(
        {
          userId: user.id,
          provider: this.providerName,
          providerUserId: profile.providerUserId,
          providerEmail: profile.email,
          providerDisplayName: profile.displayName,
          providerAvatarUrl: profile.avatarUrl,
        },
        client,
      );

      return { userId: user.id, workspaceId: result.workspaceId, tenantId: result.tenantId };
    });

    await this.sessionService.onWorkspaceCreated({ tenantId, workspaceId, createdByUserId: userId });

    const session = await this.sessionService.issueWorkspaceSession({
      userId,
      workspaceId,
      context,
    });

    return {
      nextStep: 'WORKSPACE_SELECTED',
      ...session,
    } satisfies WorkspaceSelectedLoginResult;
  }

  protected abstract exchangeAndFetchProfile(code: string, codeVerifier?: string): Promise<OAuthUserProfile>;

  private async loginExistingUser(userId: string, context: AuthContext): Promise<LoginResult> {
    await this.userService.updateLastLogin(userId);

    const workspaces = await this.sessionService.listWorkspaceIdentities(userId);
    if (workspaces.length === 0) {
      throw new UnauthorizedException('User does not have an active workspace membership.');
    }

    if (workspaces.length === 1) {
      const session = await this.sessionService.issueWorkspaceSession({
        userId,
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
      userId,
      workspaces,
      selectionToken: this.tokenService.createWorkspaceSelectionToken({ userId }),
    };
  }
}
