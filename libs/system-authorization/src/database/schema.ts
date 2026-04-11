import type { Generated } from '@ikary/system-db-core';
import type { ScopeType, TargetType } from '../interfaces/authorization.types';

export interface FeaturesTable {
  id: Generated<string>;
  code: string;
  description: string | null;
  created_at: Generated<Date>;
}

export interface DomainsTable {
  id: Generated<string>;
  code: string;
  description: string | null;
  created_at: Generated<Date>;
}

export interface RolesTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface GroupsTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface UserRolesTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string | null;
  user_id: string;
  role_id: string;
  created_at: Generated<Date>;
}

export interface UserGroupsTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string;
  user_id: string;
  group_id: string;
  created_at: Generated<Date>;
}

export interface PermissionAssignmentsTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string | null;
  cell_id: string | null;
  target_type: TargetType;
  target_id: string;
  scope_type: ScopeType;
  scope_code: string;
  access_level: number;
  created_at: Generated<Date>;
}

export interface UsersTableRef {
  id: string;
  email: string;
  deleted_at: Date | null;
}

export interface AuthorizationDatabaseSchema {
  features: FeaturesTable;
  domains: DomainsTable;
  roles: RolesTable;
  groups: GroupsTable;
  user_roles: UserRolesTable;
  user_groups: UserGroupsTable;
  permission_assignments: PermissionAssignmentsTable;
  users: UsersTableRef;
}
