export interface RoleRecord {
  id: string;
  tenant_id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  member_count?: number;
}

export interface RoleMemberRecord {
  userId: string;
  email: string;
  role_code: string;
}
