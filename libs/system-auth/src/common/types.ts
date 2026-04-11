import type { AuthModuleOptions } from '../config/auth-options.schema';

export type ProviderName = 'classic' | 'github' | 'google' | 'sso' | 'okta';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface TenantIdentity {
  id: string;
  slug: string;
  name: string;
  defaultLanguage?: string;
}

export interface WorkspaceIdentity {
  id: string;
  tenantId: string;
  tenantName?: string;
  tenantSlug?: string;
  slug: string;
  name: string;
  roleCode?: string;
  defaultLanguage?: string;
}

export interface AuthenticatedPrincipal {
  userId: string;
  tenantId: string;
  workspaceId: string;
  isSystemAdmin: boolean;
  tokenType: 'access' | 'refresh';
  jti?: string;
}

export interface AuthContext {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  userId?: string;
  tenantId?: string;
  workspaceId?: string;
}

export interface SignupResult {
  userId: string;
  tenantId: string;
  workspaceId: string;
  requiresEmailVerification: boolean;
  tokens?: AuthTokens;
}

export interface WorkspaceSessionResult {
  userId: string;
  user?: {
    id: string;
    email?: string;
    isSystemAdmin?: boolean;
    preferredLanguage?: string | null;
  };
  tenant: TenantIdentity;
  workspace: WorkspaceIdentity;
  workspaces: WorkspaceIdentity[];
  tokens: AuthTokens;
}

export interface WorkspaceSelectionRequiredResult {
  nextStep: 'SELECT_WORKSPACE';
  userId: string;
  workspaces: WorkspaceIdentity[];
  selectionToken: string;
}

export interface WorkspaceSelectedLoginResult extends WorkspaceSessionResult {
  nextStep: 'WORKSPACE_SELECTED';
}

export type LoginResult = WorkspaceSelectedLoginResult | WorkspaceSelectionRequiredResult;

export interface VerificationDispatchResult {
  delivery: 'code' | 'click';
  expiresAt: Date;
}

export type MutableConfig = Omit<AuthModuleOptions, never>;
