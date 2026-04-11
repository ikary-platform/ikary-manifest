export interface WorkspaceMembershipRecord {
  id: string;
  tenant_id: string;
  workspace_id: string;
  user_id: string;
  status: 'active' | 'invited' | 'suspended';
  role_code?: string | null;
  deleted_at: Date | null;
  email?: string | null;
}

export interface TenantMemberRecord {
  id: string;
  tenant_id: string;
  user_id: string;
  status: 'active' | 'invited' | 'suspended' | 'revoked';
  created_at: Date;
  email: string;
}

export interface UserWorkspaceRecord {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  tenant_default_language?: string | null;
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  workspace_default_language?: string | null;
  role_code?: string | null;
}
