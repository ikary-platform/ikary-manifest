import type { Generated } from '@ikary/system-db-core';

export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string | null;
  is_email_verified: Generated<boolean>;
  is_system_admin: Generated<boolean>;
  preferred_language: string | null;
  email_verified_at: Date | null;
  last_login_at: Date | null;
  deleted_at: Date | null;
  updated_at: Generated<Date>;
}

export interface RefreshTokensTable {
  id: Generated<string>;
  jti: string;
  tenant_id: string;
  workspace_id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  replaced_by_jti: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface AuthTokenTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string;
  user_id: string;
  strategy?: 'code' | 'click';
  token_hash: string | null;
  code_hash: string | null;
  expires_at: Date;
  consumed_at: Date | null;
  created_at: Generated<Date>;
}

export interface PasswordResetTokenTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
  created_at: Generated<Date>;
}

export interface AuditLogsTable {
  id: Generated<string>;
  workspace_id: string | null;
  actor_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  http_method: string | null;
  request_path: string | null;
  ip_address: string | null;
  user_agent: string | null;
  request_id: string | null;
  status_code: number | null;
  metadata: unknown;
}

export interface WorkspacesTable {
  id: Generated<string>;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  default_language: string | null;
  created_by_user_id: string | null;
  deleted_at: Date | null;
}

export interface WorkspaceMembersTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string;
  user_id: string;
  status: 'active' | 'invited' | 'suspended';
  role_code: string | null;
  deleted_at: Date | null;
}

export interface TenantsTable {
  id: Generated<string>;
  name: string;
  slug: string;
  default_language: string;
  status: 'ACTIVE' | 'DISABLED';
  user_login_enabled: Generated<boolean>;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export interface TenantMembersTable {
  id: Generated<string>;
  tenant_id: string;
  user_id: string;
  status: 'active' | 'invited' | 'suspended' | 'revoked';
  display_name: string | null;
  avatar_url: string | null;
  invited_by_user_id: string | null;
  role_code: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface WorkspaceInvitationsTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string;
  invitee_email: string;
  invitee_user_id: string | null;
  invitee_tenant_member_id: string | null;
  invited_by_user_id: string | null;
  workspace_member_id: string | null;
  invited_role: string;
  token_hash: string;
  status: Generated<'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked'>;
  expires_at: Date;
  consumed_at: Date | null;
  created_at: Generated<Date>;
}

export interface SignupRequestsTable {
  id: Generated<string>;
  email: string;
  code_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
  created_at: Generated<Date>;
}

export interface UserOAuthAccountsTable {
  id: Generated<string>;
  user_id: string;
  provider: 'github' | 'google';
  provider_user_id: string;
  provider_email: string | null;
  provider_display_name: string | null;
  provider_avatar_url: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface OAuthStateTokensTable {
  id: Generated<string>;
  state_hash: string;
  provider: 'github' | 'google';
  redirect_uri: string | null;
  code_verifier: string | null;
  metadata: unknown;
  expires_at: Date;
  consumed_at: Date | null;
  created_at: Generated<Date>;
}

export interface SsoSessionsTable {
  id: Generated<string>;
  user_id: string;
  tenant_id: string;
  workspace_id: string | null;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Generated<Date>;
}

export interface AuthDatabaseSchema {
  users: UsersTable;
  refresh_tokens: RefreshTokensTable;
  sso_sessions: SsoSessionsTable;
  email_verification_tokens: AuthTokenTable;
  password_reset_tokens: PasswordResetTokenTable;
  magic_link_tokens: AuthTokenTable;
  audit_logs: AuditLogsTable;
  workspaces: WorkspacesTable;
  workspace_members: WorkspaceMembersTable;
  tenants: TenantsTable;
  tenant_members: TenantMembersTable;
  workspace_invitations: WorkspaceInvitationsTable;
  signup_requests: SignupRequestsTable;
  user_oauth_accounts: UserOAuthAccountsTable;
  oauth_state_tokens: OAuthStateTokensTable;
}
