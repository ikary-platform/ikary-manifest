export {
  AuthorizationModule,
  type RegisterAuthorizationModuleOptions,
} from './modules/authorization/authorization.module';
export { AuthorizationService } from './services/authorization.service';
export type { RoleRecord, RoleMemberRecord } from './modules/roles/roles.types';
export type { AssignmentRecord } from './modules/assignments/assignments.repository';

export { AccessLevel } from './interfaces/access-level.enum';
export type {
  AuthorizationPrincipal,
  JwtScopesPayload,
  PermissionAssignmentInput,
  ResolvedPermissions,
  ScopeType,
  TargetType,
} from './interfaces/authorization.types';

export { RequireFeature } from './decorators/require-feature.decorator';
export { RequireDomain } from './decorators/require-domain.decorator';
export { RequireQuota, type LicenseQuotaResource } from './decorators/require-quota.decorator';
export { REQUIRE_QUOTA_KEY } from './config/constants';
export { FeatureGuard } from './guards/feature.guard';
export { DomainGuard } from './guards/domain.guard';
export { AuthorizationScopesInterceptor } from './interceptors/authorization-scopes.interceptor';

export { PermissionNamespaceRegistry, type NamespacedPermission } from './registry/permission-namespace.registry';
