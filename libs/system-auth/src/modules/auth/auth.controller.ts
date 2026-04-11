import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Ip,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import type { IncomingHttpHeaders } from 'http';
import { Public } from '../../decorators/public.decorator';
import { SsoCookie } from '../../decorators/sso-cookie.decorator';
import { AuthConfigService } from '../../config/auth-config.service';
import { AuthService } from './auth.service';
import { SsoSessionService } from './sso-session.service';
import type { LoginResult, WorkspaceSessionResult } from '../../common/types';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuthConfigService) private readonly authConfig: AuthConfigService,
    @Inject(SsoSessionService) private readonly ssoSessionService: SsoSessionService,
  ) {}

  @Public()
  @Post('signup')
  async signup(
    @Body() body: unknown,
    @Headers() headers: IncomingHttpHeaders,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!this.authConfig.config.classic.signup) {
      throw new NotFoundException('Route not found.');
    }

    const result = await this.authService.signupClassic(body, this.toContext(headers, ip));
    await this.trySetSsoCookie(result, headers, ip, res);
    return result;
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: unknown,
    @Headers() headers: IncomingHttpHeaders,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginClassic(body, this.toContext(headers, ip));
    await this.trySetSsoCookie(result, headers, ip, res);
    return result;
  }

  @Public()
  @Post('refresh')
  refresh(@Body() body: unknown, @Headers() headers: IncomingHttpHeaders, @Ip() ip: string) {
    return this.authService.refreshClassic(body, this.toContext(headers, ip));
  }

  @Public()
  @Post('select-workspace')
  async selectWorkspace(
    @Body() body: unknown,
    @Headers() headers: IncomingHttpHeaders,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.selectWorkspaceClassic(body, this.toContext(headers, ip));
    await this.trySetSsoCookie(result, headers, ip, res);
    return result;
  }

  @Post('switch-workspace')
  switchWorkspace(
    @Body() body: unknown,
    @Headers() headers: IncomingHttpHeaders,
    @Ip() ip: string,
    @Req() request: { auth?: { userId?: string; tenantId?: string; workspaceId?: string; isSystemAdmin?: boolean } },
  ) {
    return this.authService.switchWorkspaceClassic(body, this.toContext(headers, ip, request.auth));
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() body: unknown, @Headers() headers: IncomingHttpHeaders, @Ip() ip: string) {
    if (!this.authConfig.config.classic.resetPassword) {
      throw new NotFoundException('Route not found.');
    }

    return this.authService.forgotPasswordClassic(body, this.toContext(headers, ip));
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() body: unknown, @Headers() headers: IncomingHttpHeaders, @Ip() ip: string) {
    if (!this.authConfig.config.classic.resetPassword) {
      throw new NotFoundException('Route not found.');
    }

    return this.authService.resetPasswordClassic(body, this.toContext(headers, ip));
  }

  @Post('change-password')
  changePassword(
    @Body() body: unknown,
    @Headers() headers: IncomingHttpHeaders,
    @Ip() ip: string,
    @Req() request: { auth?: { userId?: string; tenantId?: string; workspaceId?: string } },
  ) {
    if (!this.authConfig.config.classic.resetPassword) {
      throw new NotFoundException('Route not found.');
    }

    return this.authService.changePasswordClassic(body, this.toContext(headers, ip, request.auth));
  }

  @Public()
  @Post('verify-email')
  verifyEmail(@Body() body: unknown, @Headers() headers: IncomingHttpHeaders, @Ip() ip: string) {
    return this.authService.verifyEmailClassic(body, this.toContext(headers, ip));
  }

  @Public()
  @Post('magic-link/request')
  requestMagicLink(@Body() body: unknown, @Headers() headers: IncomingHttpHeaders, @Ip() ip: string) {
    return this.authService.requestMagicLinkClassic(body, this.toContext(headers, ip));
  }

  @Public()
  @Post('magic-link/consume')
  async consumeMagicLink(
    @Body() body: unknown,
    @Headers() headers: IncomingHttpHeaders,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.consumeMagicLinkClassic(body, this.toContext(headers, ip));
    await this.trySetSsoCookie(result, headers, ip, res);
    return result;
  }

  @Public()
  @Get('providers')
  getProviders() {
    return { providers: this.authService.getEnabledProviders() };
  }

  @Public()
  @Get('github/authorize')
  getGitHubAuthorizationUrl(@Query() query: unknown) {
    if (!this.authConfig.config.github.enabled) {
      throw new NotFoundException('Route not found.');
    }
    return this.authService.getGitHubAuthorizationUrl(query ?? {});
  }

  @Public()
  @Post('github/callback')
  handleGitHubCallback(@Body() body: unknown, @Headers() headers: IncomingHttpHeaders, @Ip() ip: string) {
    if (!this.authConfig.config.github.enabled) {
      throw new NotFoundException('Route not found.');
    }
    return this.authService.handleGitHubCallback(body, this.toContext(headers, ip));
  }

  @Public()
  @Get('google/authorize')
  getGoogleAuthorizationUrl(@Query() query: unknown) {
    if (!this.authConfig.config.google.enabled) {
      throw new NotFoundException('Route not found.');
    }
    return this.authService.getGoogleAuthorizationUrl(query ?? {});
  }

  @Public()
  @Post('google/callback')
  handleGoogleCallback(@Body() body: unknown, @Headers() headers: IncomingHttpHeaders, @Ip() ip: string) {
    if (!this.authConfig.config.google.enabled) {
      throw new NotFoundException('Route not found.');
    }
    return this.authService.handleGoogleCallback(body, this.toContext(headers, ip));
  }

  @Public()
  @Post('signup/initiate')
  initiateSignup(@Body() body: unknown) {
    if (!this.authConfig.config.classic.signup) {
      throw new NotFoundException('Route not found.');
    }

    return this.authService.initiateSignupClassic(body);
  }

  @Public()
  @Post('signup/complete')
  async completeSignup(
    @Body() body: unknown,
    @Headers() headers: IncomingHttpHeaders,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!this.authConfig.config.classic.signup) {
      throw new NotFoundException('Route not found.');
    }

    const result = await this.authService.completeSignupClassic(body, this.toContext(headers, ip));
    await this.trySetSsoCookie(result, headers, ip, res);
    return result;
  }

  // ─── SSO endpoints ────────────────────────────────────────────────────────

  /**
   * Exchanges the `ikary_sso` httpOnly cookie for a fresh workspace session.
   * Used by apps to silently authenticate when localStorage is empty (e.g. first
   * visit after logging in from another app on the same host/domain).
   */
  @Public()
  @Post('sso-bootstrap')
  async ssoBootstrap(
    @SsoCookie() rawToken: string | null,
    @Headers() headers: IncomingHttpHeaders,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!rawToken) throw new UnauthorizedException();

    const claims = await this.ssoSessionService.validateSession(rawToken);
    if (!claims) throw new UnauthorizedException();
    if (!claims.workspaceId) throw new UnauthorizedException();

    const session = await this.authService.issueSessionFromSso(
      { userId: claims.userId, workspaceId: claims.workspaceId },
      this.toContext(headers, ip),
    );

    // Slide the cookie expiry on each successful bootstrap
    res.cookie('ikary_sso', rawToken, this.cookieOptions());

    return session;
  }

  /**
   * Revokes the `ikary_sso` SSO cookie. Call this on user logout to prevent
   * silent re-authentication in other apps sharing the same cookie domain.
   */
  @Public()
  @Post('logout')
  async logout(@SsoCookie() rawToken: string | null, @Res({ passthrough: true }) res: Response) {
    if (rawToken) {
      await this.ssoSessionService.revokeSession(rawToken);
    }
    res.clearCookie('ikary_sso', { domain: this.authConfig.config.cookie.domain, path: '/' });
  }

  /**
   * Cross-domain SSO bootstrap — step 1 (GET, top-level navigation).
   * Reads the ikary_sso cookie (sent by the browser on cross-site GET navigations
   * because SameSite=Lax allows it), validates the session, generates a short-lived
   * one-time exchange code, and redirects to `returnTo?sso_code=<code>`.
   *
   * Falls through to `returnTo` without a code if no cookie or invalid session,
   * allowing the cell-UI to surface a login prompt.
   */
  @Public()
  @Get('sso-exchange')
  async ssoExchange(@SsoCookie() rawToken: string | null, @Query('returnTo') returnTo: string, @Res() res: Response) {
    let safeReturnTo: string;
    try {
      const url = new URL(returnTo);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
      safeReturnTo = returnTo;
    } catch {
      throw new BadRequestException('Invalid returnTo URL');
    }

    if (!rawToken) {
      return res.redirect(safeReturnTo);
    }

    const claims = await this.ssoSessionService.validateSession(rawToken);
    if (!claims || !claims.workspaceId) {
      return res.redirect(safeReturnTo);
    }

    const code = this.ssoSessionService.createExchangeCode(claims.userId, claims.workspaceId);
    const redirect = new URL(safeReturnTo);
    redirect.searchParams.set('sso_code', code);
    return res.redirect(redirect.toString());
  }

  /**
   * Cross-domain SSO bootstrap — step 2 (POST, no cookies required).
   * Consumes the one-time code issued by GET /auth/sso-exchange and returns
   * a fresh workspace session. Uses JSON body, not cookies, so CORS allows it
   * from any configured origin.
   */
  @Public()
  @Post('sso-exchange/consume')
  async consumeSsoExchange(@Body() body: unknown, @Headers() headers: IncomingHttpHeaders, @Ip() ip: string) {
    const code = (body as Record<string, unknown>)?.['code'];
    if (typeof code !== 'string' || !code) throw new UnauthorizedException();

    const claims = this.ssoSessionService.consumeExchangeCode(code);
    if (!claims) throw new UnauthorizedException();

    return this.authService.issueSessionFromSso(
      { userId: claims.userId, workspaceId: claims.workspaceId },
      this.toContext(headers, ip),
    );
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Sets the `ikary_sso` cookie when the result contains a workspace session.
   * Safe to call with any auth result — no-ops on intermediate steps (e.g. SELECT_WORKSPACE).
   */
  private async trySetSsoCookie(
    result: LoginResult | WorkspaceSessionResult | unknown,
    headers: IncomingHttpHeaders,
    ip: string,
    res: Response,
  ): Promise<void> {
    try {
      if (!result || typeof result !== 'object' || !('tokens' in result)) return;

      const session = result as WorkspaceSessionResult;
      if (!session.userId || !session.workspace?.tenantId || !session.workspace?.id) return;

      const rawToken = await this.ssoSessionService.createSession({
        userId: session.userId,
        tenantId: session.workspace.tenantId,
        workspaceId: session.workspace.id,
        ipAddress: ip,
        userAgent: this.asSingleHeader(headers['user-agent']),
      });
      res.cookie('ikary_sso', rawToken, this.cookieOptions());
    } catch {
      // SSO cookie failure is non-fatal — login still succeeds without cross-app SSO
    }
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.authConfig.config.cookie.secure,
      sameSite: 'lax' as const,
      domain: this.authConfig.config.cookie.domain,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    };
  }

  private toContext(
    headers: IncomingHttpHeaders,
    ipAddress: string,
    auth?: { userId?: string; tenantId?: string; workspaceId?: string },
  ) {
    return {
      ipAddress,
      userAgent: this.asSingleHeader(headers['user-agent']),
      requestId: this.asSingleHeader(headers['x-request-id']),
      userId: auth?.userId,
      tenantId: auth?.tenantId,
      workspaceId: auth?.workspaceId,
    };
  }

  private asSingleHeader(value: string | string[] | undefined): string | undefined {
    if (!value) {
      return undefined;
    }

    return Array.isArray(value) ? value[0] : value;
  }
}
