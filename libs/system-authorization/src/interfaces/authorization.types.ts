import { AccessLevel } from './access-level.enum';

export type ScopeType = 'FEATURE' | 'DOMAIN';
export type TargetType = 'USER' | 'ROLE' | 'GROUP';

export interface ResolvedPermissions {
  featureScopes: Record<string, AccessLevel>;
  domainScopes: Record<string, AccessLevel>;
}

export interface JwtScopesPayload {
  featureScopes: Record<string, number>;
  domainScopes: Record<string, number>;
}

export interface AuthorizationPrincipal {
  userId: string;
  tenantId?: string;
  workspaceId: string;
  cellId?: string;
  isSystemAdmin?: boolean;
  featureScopes?: Record<string, number>;
  domainScopes?: Record<string, number>;
}

export interface PermissionAssignmentInput {
  tenantId: string;
  workspaceId?: string | null;
  cellId?: string | null;
  targetType: TargetType;
  targetId: string;
  scopeType: ScopeType;
  scopeCode: string;
  accessLevel: AccessLevel;
}
