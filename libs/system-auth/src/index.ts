export { AuthModule, type RegisterAuthModuleOptions } from './modules/auth/auth.module';
export {
  AuthProvisioningService,
  type ProvisionClassicUserInput,
  type ProvisionClassicUserResult,
} from './modules/auth/auth-provisioning.service';
export { AuthService } from './modules/auth/auth.service';
export { AuthController } from './modules/auth/auth.controller';
export { AuthRepository } from './modules/auth/auth.repository';
export { TokenService } from './modules/auth/token.service';
export { HashService } from './common/hash.service';
export { UserService } from './modules/user/user.service';

export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { TenantGuard } from './guards/tenant.guard';
export { WorkspaceGuard } from './guards/workspace.guard';
export { AuditInterceptor } from './interceptors/audit.interceptor';
export { AuditService as AuthAuditService } from './modules/audit/audit.service';
export type { AuditLogCreateInput } from './modules/audit/audit.types';

export { Public } from './decorators/public.decorator';
export { CurrentAuth, type CurrentAuthValue } from './decorators/current-auth.decorator';
export { RequireAuthScope, type AuthRouteScope } from './decorators/require-auth-scope.decorator';

export { AUTH_NOTIFICATION_PORT, AUTH_ROUTE_SCOPE_KEY } from './config/constants';
export type { AuthNotificationPort } from './modules/auth/notification.port';

export type { AuthProvider } from './providers/auth-provider.interface';
export { ClassicAuthProvider } from './providers/classic/classic-auth.provider';
export { GitHubAuthProvider } from './providers/github/github-auth.provider';
export { GoogleAuthProvider } from './providers/google/google-auth.provider';
export { OAuthBaseProvider, type OAuthUserProfile } from './providers/oauth/oauth-base.provider';

export { OAuthRepository } from './modules/auth/oauth.repository';
export { AuthSessionService } from './modules/auth/auth-session.service';
export { SsoSessionService } from './modules/auth/sso-session.service';

export { SsoCookie } from './decorators/sso-cookie.decorator';

export type { AuthModuleOptions, ClassicProviderConfig, OAuthProviderConfig } from './config/auth-options.schema';

export { WORKSPACE_LIFECYCLE_PORT, type WorkspaceLifecyclePort } from './modules/workspace/workspace-lifecycle.port';
export {
  WorkspaceInvitationService,
  type CreateInvitationInput,
  type AcceptInvitationInput,
  type RevokeInvitationInput,
} from './modules/workspace-membership/workspace-invitation.service';
export { WorkspaceMembershipRepository } from './modules/workspace-membership/workspace-membership.repository';
export type {
  TenantMemberRecord,
  WorkspaceMembershipRecord,
} from './modules/workspace-membership/workspace-membership.types';
