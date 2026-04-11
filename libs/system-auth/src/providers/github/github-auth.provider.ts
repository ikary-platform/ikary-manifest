import { Inject, Injectable } from '@nestjs/common';
import type { ProviderName } from '../../common/types';
import { AuthConfigService } from '../../config/auth-config.service';
import { HashService } from '../../common/hash.service';
import { OAuthRepository } from '../../modules/auth/oauth.repository';
import { AuthSessionService } from '../../modules/auth/auth-session.service';
import { UserService } from '../../modules/user/user.service';
import { TokenService } from '../../modules/auth/token.service';
import { OAuthBaseProvider, type OAuthUserProfile } from '../oauth/oauth-base.provider';
import { GitHubOAuthClient } from './github-oauth.client';
import { oauthInitiateSchema } from '../oauth/oauth-auth.schemas';

@Injectable()
export class GitHubAuthProvider extends OAuthBaseProvider {
  readonly provider: ProviderName = 'github';

  constructor(
    @Inject(OAuthRepository) oauthRepository: OAuthRepository,
    @Inject(AuthSessionService) sessionService: AuthSessionService,
    @Inject(UserService) userService: UserService,
    @Inject(TokenService) tokenService: TokenService,
    @Inject(AuthConfigService) private readonly configService: AuthConfigService,
    @Inject(HashService) private readonly hashService: HashService,
    @Inject(GitHubOAuthClient) private readonly githubClient: GitHubOAuthClient,
  ) {
    super(oauthRepository, sessionService, userService, tokenService, configService.config.github);
  }

  protected get providerName(): 'github' {
    return 'github';
  }

  async getAuthorizationUrl(input: unknown): Promise<{ url: string }> {
    const payload = oauthInitiateSchema.parse(input);
    const state = this.hashService.generateOpaqueToken();

    await this.oauthRepository.createStateToken({
      state,
      provider: 'github',
      redirectUri: payload.redirectUri,
      metadata: payload.signupIntent ? { signupIntent: payload.signupIntent } : undefined,
    });

    const config = this.configService.config.github;
    const params = new URLSearchParams({
      client_id: config.clientId,
      scope: 'user:email read:user',
      state,
      redirect_uri: config.callbackUrl,
    });

    return {
      url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    };
  }

  protected async exchangeAndFetchProfile(code: string): Promise<OAuthUserProfile> {
    const config = this.configService.config.github;
    const tokenResponse = await this.githubClient.exchangeCode(code, config.clientId, config.clientSecret);
    const [user, emails] = await Promise.all([
      this.githubClient.getUser(tokenResponse.access_token),
      this.githubClient.getUserEmails(tokenResponse.access_token),
    ]);

    // Find primary verified email
    const primaryEmail = emails.find((e) => e.primary && e.verified);
    const verifiedEmail = primaryEmail ?? emails.find((e) => e.verified);
    const email = verifiedEmail?.email ?? user.email;

    return {
      providerUserId: String(user.id),
      email: email ?? '',
      isEmailVerified: Boolean(verifiedEmail?.verified),
      displayName: user.name ?? user.login,
      avatarUrl: user.avatar_url ?? undefined,
    };
  }
}
