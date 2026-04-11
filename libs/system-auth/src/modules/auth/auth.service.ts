import { Inject, Injectable, NotImplementedException, Optional } from '@nestjs/common';
import { AUTH_PROVIDERS } from '../../config/constants';
import { AuthConfigService } from '../../config/auth-config.service';
import type { AuthContext, LoginResult, ProviderName, SignupResult, WorkspaceSessionResult } from '../../common/types';
import type { AuthProvider } from '../../providers/auth-provider.interface';
import { ClassicAuthProvider } from '../../providers/classic/classic-auth.provider';
import { GitHubAuthProvider } from '../../providers/github/github-auth.provider';
import { GoogleAuthProvider } from '../../providers/google/google-auth.provider';

@Injectable()
export class AuthService {
  private readonly providerMap: Map<ProviderName, AuthProvider>;

  constructor(
    @Inject(AUTH_PROVIDERS) providers: AuthProvider[],
    @Inject(ClassicAuthProvider) private readonly classicProvider: ClassicAuthProvider,
    @Inject(AuthConfigService) private readonly configService: AuthConfigService,
    @Optional() @Inject(GitHubAuthProvider) private readonly githubProvider?: GitHubAuthProvider,
    @Optional() @Inject(GoogleAuthProvider) private readonly googleProvider?: GoogleAuthProvider,
  ) {
    this.providerMap = new Map(providers.map((provider) => [provider.provider, provider]));
  }

  signupClassic(input: unknown, context: AuthContext): Promise<SignupResult> {
    return this.getProvider('classic').signup(input, context);
  }

  loginClassic(input: unknown, context: AuthContext): Promise<LoginResult> {
    return this.getProvider('classic').login(input, context);
  }

  refreshClassic(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult> {
    return this.getProvider('classic').refresh(input, context);
  }

  selectWorkspaceClassic(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult> {
    const provider = this.getProvider('classic');
    if (!provider.selectWorkspace) {
      throw new NotImplementedException('Workspace selection is not implemented for this provider.');
    }

    return provider.selectWorkspace(input, context);
  }

  switchWorkspaceClassic(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult> {
    const provider = this.getProvider('classic');
    if (!provider.switchWorkspace) {
      throw new NotImplementedException('Workspace switching is not implemented for this provider.');
    }

    return provider.switchWorkspace(input, context);
  }

  forgotPasswordClassic(input: unknown, context: AuthContext): Promise<void> {
    return this.getProvider('classic').forgotPassword(input, context);
  }

  resetPasswordClassic(input: unknown, context: AuthContext): Promise<void> {
    return this.getProvider('classic').resetPassword(input, context);
  }

  changePasswordClassic(input: unknown, context: AuthContext): Promise<void> {
    return this.classicProvider.changePassword(input, context);
  }

  verifyEmailClassic(input: unknown, context: AuthContext): Promise<void> {
    return this.getProvider('classic').verifyEmail(input, context);
  }

  requestMagicLinkClassic(input: unknown, context: AuthContext): Promise<void> {
    const provider = this.getProvider('classic');
    if (!provider.requestMagicLink) {
      throw new NotImplementedException('Magic link is not implemented for this provider.');
    }

    return provider.requestMagicLink(input, context);
  }

  consumeMagicLinkClassic(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult> {
    const provider = this.getProvider('classic');
    if (!provider.consumeMagicLink) {
      throw new NotImplementedException('Magic link is not implemented for this provider.');
    }

    return provider.consumeMagicLink(input, context);
  }

  initiateSignupClassic(input: unknown): Promise<{ sent: boolean }> {
    return this.classicProvider.initiateSignup(input);
  }

  completeSignupClassic(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult> {
    return this.classicProvider.completeSignup(input, context);
  }

  issueSessionFromSso(
    claims: { userId: string; workspaceId: string },
    context: AuthContext,
  ): Promise<WorkspaceSessionResult> {
    return this.classicProvider.issueSessionFromSso(claims, context);
  }

  getEnabledProviders(): ProviderName[] {
    return Array.from(this.providerMap.keys());
  }

  getGitHubAuthorizationUrl(input: unknown): Promise<{ url: string }> {
    if (!this.githubProvider) {
      throw new NotImplementedException('GitHub auth provider is not registered.');
    }
    return this.githubProvider.getAuthorizationUrl(input);
  }

  handleGitHubCallback(input: unknown, context: AuthContext): Promise<LoginResult> {
    if (!this.githubProvider) {
      throw new NotImplementedException('GitHub auth provider is not registered.');
    }
    return this.githubProvider.handleCallback(input as { code: string; state: string }, context);
  }

  getGoogleAuthorizationUrl(input: unknown): Promise<{ url: string }> {
    if (!this.googleProvider) {
      throw new NotImplementedException('Google auth provider is not registered.');
    }
    return this.googleProvider.getAuthorizationUrl(input);
  }

  handleGoogleCallback(input: unknown, context: AuthContext): Promise<LoginResult> {
    if (!this.googleProvider) {
      throw new NotImplementedException('Google auth provider is not registered.');
    }
    return this.googleProvider.handleCallback(input as { code: string; state: string }, context);
  }

  private getProvider(name: ProviderName): AuthProvider {
    const provider = this.providerMap.get(name);
    if (!provider) {
      throw new NotImplementedException(`Auth provider ${name} is not registered.`);
    }

    return provider;
  }
}
