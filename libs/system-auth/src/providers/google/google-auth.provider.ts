import { Inject, Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import type { ProviderName } from '../../common/types';
import { AuthConfigService } from '../../config/auth-config.service';
import { HashService } from '../../common/hash.service';
import { OAuthRepository } from '../../modules/auth/oauth.repository';
import { AuthSessionService } from '../../modules/auth/auth-session.service';
import { UserService } from '../../modules/user/user.service';
import { TokenService } from '../../modules/auth/token.service';
import { OAuthBaseProvider, type OAuthUserProfile } from '../oauth/oauth-base.provider';
import { GoogleOAuthClient } from './google-oauth.client';
import { oauthInitiateSchema } from '../oauth/oauth-auth.schemas';

@Injectable()
export class GoogleAuthProvider extends OAuthBaseProvider {
  readonly provider: ProviderName = 'google';

  constructor(
    @Inject(OAuthRepository) oauthRepository: OAuthRepository,
    @Inject(AuthSessionService) sessionService: AuthSessionService,
    @Inject(UserService) userService: UserService,
    @Inject(TokenService) tokenService: TokenService,
    @Inject(AuthConfigService) private readonly configService: AuthConfigService,
    @Inject(HashService) private readonly hashService: HashService,
    @Inject(GoogleOAuthClient) private readonly googleClient: GoogleOAuthClient,
  ) {
    super(oauthRepository, sessionService, userService, tokenService, configService.config.google);
  }

  protected get providerName(): 'google' {
    return 'google';
  }

  async getAuthorizationUrl(input: unknown): Promise<{ url: string }> {
    const payload = oauthInitiateSchema.parse(input);
    const state = this.hashService.generateOpaqueToken();

    // PKCE: generate code_verifier and code_challenge
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

    await this.oauthRepository.createStateToken({
      state,
      provider: 'google',
      redirectUri: payload.redirectUri,
      codeVerifier,
      metadata: payload.signupIntent ? { signupIntent: payload.signupIntent } : undefined,
    });

    const config = this.configService.config.google;
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      access_type: 'offline',
      prompt: 'consent',
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    };
  }

  protected async exchangeAndFetchProfile(code: string, codeVerifier?: string): Promise<OAuthUserProfile> {
    const config = this.configService.config.google;
    const tokenResponse = await this.googleClient.exchangeCode(
      code,
      config.clientId,
      config.clientSecret,
      config.callbackUrl,
      codeVerifier,
    );

    const userInfo = await this.googleClient.getUserInfo(tokenResponse.access_token);

    return {
      providerUserId: userInfo.sub,
      email: userInfo.email,
      isEmailVerified: userInfo.email_verified,
      displayName: userInfo.name ?? undefined,
      avatarUrl: userInfo.picture ?? undefined,
    };
  }
}
