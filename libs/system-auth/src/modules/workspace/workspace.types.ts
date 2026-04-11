export interface WorkspaceRecord {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_by_user_id: string | null;
  deleted_at: Date | null;
}
