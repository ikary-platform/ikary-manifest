import type { Abstract, DynamicModule, ForwardReference } from '@nestjs/common';
import { Module, type Provider, type Type } from '@nestjs/common';
import { AuthConfigService } from '../../config/auth-config.service';
import { authModuleOptionsSchema, type AuthModuleOptions } from '../../config/auth-options.schema';
import { AUTH_MODULE_OPTIONS, AUTH_NOTIFICATION_PORT, AUTH_PROVIDERS } from '../../config/constants';
import { HashService } from '../../common/hash.service';
import { DatabaseService } from '../../database/database.service';
import { DefaultNotificationAdapter } from './default-notification.adapter';
import type { AuthNotificationPort } from './notification.port';
import { AuthController } from './auth.controller';
import { AuthProvisioningService } from './auth-provisioning.service';
import { AuthRepository } from './auth.repository';
import { SignupRequestRepository } from './signup-request.repository';
import { AuthService } from './auth.service';
import { SsoSessionService } from './sso-session.service';
import { TokenService } from './token.service';
import { ClassicAuthProvider } from '../../providers/classic/classic-auth.provider';
import { GitHubAuthProvider } from '../../providers/github/github-auth.provider';
import { GoogleAuthProvider } from '../../providers/google/google-auth.provider';
import { GitHubOAuthClient } from '../../providers/github/github-oauth.client';
import { GoogleOAuthClient } from '../../providers/google/google-oauth.client';
import { OAuthRepository } from './oauth.repository';
import { AuthSessionService } from './auth-session.service';
import { AuditRepository } from '../audit/audit.repository';
import { AuditService } from '../audit/audit.service';
import { WorkspaceMembershipRepository } from '../workspace-membership/workspace-membership.repository';
import { WorkspaceMembershipService } from '../workspace-membership/workspace-membership.service';
import { WorkspaceInvitationRepository } from '../workspace-membership/workspace-invitation.repository';
import { WorkspaceInvitationService } from '../workspace-membership/workspace-invitation.service';
import { WorkspaceRepository } from '../workspace/workspace.repository';
import { WorkspaceService } from '../workspace/workspace.service';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';

export type RegisterAuthModuleOptions = Partial<Omit<AuthModuleOptions, 'cookie'>> & {
  /**
   * SSO cookie configuration. Required — forces explicit per-deployment setting.
   * Use `domain: 'localhost'` for local dev, `domain: '.yourcompany.com'` for production.
   */
  cookie: AuthModuleOptions['cookie'];
  /** Override the default no-op notification adapter with a custom implementation. */
  notificationAdapter?: Type<AuthNotificationPort>;
  /**
   * Additional providers to register inside AuthModule's DI scope.
   * Use this to inject app-level services (e.g. WorkspaceLifecycleAdapter) into ClassicAuthProvider.
   */
  extraProviders?: Provider[];
  /** Additional modules to import inside AuthModule's DI scope. */
  extraImports?: (Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference)[];
  /** Additional tokens to export from AuthModule (e.g. app-level adapters added via extraProviders). */
  extraExports?: (Type<any> | string | symbol | DynamicModule | Abstract<any> | Function)[];
};

@Module({})
export class AuthModule {
  static register(options: RegisterAuthModuleOptions): DynamicModule {
    const {
      notificationAdapter,
      extraProviders = [],
      extraImports = [],
      extraExports = [],
      cookie,
      ...authOptions
    } = options;
    const parsedOptions = authModuleOptionsSchema.parse(AuthModule.resolveOptions({ ...authOptions, cookie }));

    const providers: Provider[] = [
      {
        provide: AUTH_MODULE_OPTIONS,
        useValue: parsedOptions,
      },
      AuthConfigService,
      DatabaseService,
      HashService,
      TokenService,
      UserRepository,
      UserService,
      WorkspaceRepository,
      WorkspaceService,
      WorkspaceMembershipRepository,
      WorkspaceMembershipService,
      WorkspaceInvitationRepository,
      WorkspaceInvitationService,
      AuditRepository,
      AuditService,
      AuthRepository,
      SignupRequestRepository,
      OAuthRepository,
      AuthSessionService,
      SsoSessionService,
      AuthService,
      AuthProvisioningService,
      ClassicAuthProvider,
      GitHubOAuthClient,
      GoogleOAuthClient,
      ...(parsedOptions.github.enabled ? [GitHubAuthProvider] : []),
      ...(parsedOptions.google.enabled ? [GoogleAuthProvider] : []),
      {
        provide: AUTH_NOTIFICATION_PORT,
        useClass: notificationAdapter ?? DefaultNotificationAdapter,
      },
      {
        provide: AUTH_PROVIDERS,
        useFactory: (...args: any[]) => {
          const providers = [args[0]]; // classic
          let i = 1;
          if (parsedOptions.github.enabled) providers.push(args[i++]);
          if (parsedOptions.google.enabled) providers.push(args[i++]);
          return providers;
        },
        inject: [
          ClassicAuthProvider,
          ...(parsedOptions.github.enabled ? [GitHubAuthProvider] : []),
          ...(parsedOptions.google.enabled ? [GoogleAuthProvider] : []),
        ],
      },
    ];

    return {
      module: AuthModule,
      imports: [...extraImports],
      controllers: [AuthController],
      providers: [...providers, ...extraProviders],
      exports: [
        AuthService,
        AuthProvisioningService,
        AuthConfigService,
        AuthSessionService,
        SsoSessionService,
        DatabaseService,
        UserService,
        TokenService,
        HashService,
        OAuthRepository,
        AUTH_NOTIFICATION_PORT,
        AUTH_PROVIDERS,
        WorkspaceInvitationService,
        WorkspaceMembershipRepository,
        AuthRepository,
        ...extraExports,
      ],
    };
  }

  private static resolveOptions(
    options: Omit<
      RegisterAuthModuleOptions,
      'notificationAdapter' | 'extraProviders' | 'extraImports' | 'extraExports'
    >,
  ): AuthModuleOptions {
    return {
      database: {
        connectionString: options.database?.connectionString ?? process.env.DATABASE_URL ?? '',
        ssl: options.database?.ssl ?? false,
        maxPoolSize: options.database?.maxPoolSize ?? 20,
      },
      jwt: {
        accessTokenSecret: options.jwt?.accessTokenSecret ?? process.env.AUTH_ACCESS_TOKEN_SECRET ?? '',
        refreshTokenSecret: options.jwt?.refreshTokenSecret ?? process.env.AUTH_REFRESH_TOKEN_SECRET ?? '',
        tokenHashSecret: options.jwt?.tokenHashSecret ?? process.env.AUTH_TOKEN_HASH_SECRET ?? '',
        accessTokenTtlSeconds: options.jwt?.accessTokenTtlSeconds ?? 900,
        refreshTokenTtlSeconds: options.jwt?.refreshTokenTtlSeconds ?? 60 * 60 * 24 * 14,
        issuer: options.jwt?.issuer ?? 'auth-lib',
        audience: options.jwt?.audience ?? 'auth-lib-clients',
      },
      classic: options.classic ?? {
        enabled: true,
        signup: true,
        resetPassword: true,
        magicLink: false,
        emailVerification: 'code',
        passwordMinLength: 8,
        requireEmailVerification: true,
        verificationCodeLength: 6,
        verificationTokenTtlMinutes: 20,
        resetPasswordTtlMinutes: 30,
        magicLinkTtlMinutes: 15,
      },
      github: options.github ?? {
        enabled: false,
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        allowSignup: true,
        autoLinkByEmail: true,
      },
      google: options.google ?? {
        enabled: false,
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        allowSignup: true,
        autoLinkByEmail: true,
      },
      sso: options.sso ?? { enabled: false },
      okta: options.okta ?? { enabled: false },
      cookie: options.cookie,
    };
  }
}
