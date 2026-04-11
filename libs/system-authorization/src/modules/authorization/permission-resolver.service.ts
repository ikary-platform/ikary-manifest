import { Inject, Injectable } from '@nestjs/common';
import { AuthorizationConfigService } from '../../config/authorization-config.service';
import { AccessLevel } from '../../interfaces/access-level.enum';
import type { ResolvedPermissions, ScopeType } from '../../interfaces/authorization.types';
import { AssignmentsService } from '../assignments/assignments.service';
import { GroupsService } from '../groups/groups.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class PermissionResolverService {
  constructor(
    @Inject(AuthorizationConfigService) private readonly config: AuthorizationConfigService,
    @Inject(AssignmentsService) private readonly assignments: AssignmentsService,
    @Inject(RolesService) private readonly roles: RolesService,
    @Inject(GroupsService) private readonly groups: GroupsService,
  ) {}

  async resolvePermissions(userId: string, workspaceId: string, cellId?: string): Promise<ResolvedPermissions> {
    const scopeTypes = this.config.allowedScopeTypes;
    const collected = await this.collectAssignments(userId, workspaceId, scopeTypes, cellId);

    const featureScopes: ResolvedPermissions['featureScopes'] = {};
    const domainScopes: ResolvedPermissions['domainScopes'] = {};

    for (const assignment of collected) {
      const targetMap = assignment.scope_type === 'FEATURE' ? featureScopes : domainScopes;
      const current = targetMap[assignment.scope_code] ?? AccessLevel.NONE;
      const next = assignment.access_level as AccessLevel;
      targetMap[assignment.scope_code] = next > current ? next : current;
    }

    return { featureScopes, domainScopes };
  }

  async resolveTenantDomainPermissions(userId: string, tenantId: string): Promise<ResolvedPermissions['domainScopes']> {
    const assignments = await this.assignments.findTenantDomainAssignmentsForUser({
      tenantId,
      userId,
    });

    const domainScopes: ResolvedPermissions['domainScopes'] = {};

    for (const assignment of assignments) {
      const current = domainScopes[assignment.scope_code] ?? AccessLevel.NONE;
      const next = assignment.access_level as AccessLevel;
      domainScopes[assignment.scope_code] = next > current ? next : current;
    }

    return domainScopes;
  }

  private async collectAssignments(userId: string, workspaceId: string, scopeTypes: ScopeType[], cellId?: string) {
    const all = [] as Awaited<ReturnType<AssignmentsService['findAssignmentsForTarget']>>;

    const userAssignments = await this.assignments.findAssignmentsForTarget({
      workspaceId,
      cellId,
      targetType: 'USER',
      targetIds: [userId],
      scopeTypes,
    });
    all.push(...userAssignments);

    if (this.config.includesRoleAssignments()) {
      const roleIds = await this.roles.getRoleIdsForUser(workspaceId, userId);
      const roleAssignments = await this.assignments.findAssignmentsForTarget({
        workspaceId,
        cellId,
        targetType: 'ROLE',
        targetIds: roleIds,
        scopeTypes,
      });
      all.push(...roleAssignments);
    }

    if (this.config.includesGroupAssignments()) {
      const groupIds = await this.groups.getGroupIdsForUser(workspaceId, userId);
      const groupAssignments = await this.assignments.findAssignmentsForTarget({
        workspaceId,
        cellId,
        targetType: 'GROUP',
        targetIds: groupIds,
        scopeTypes,
      });
      all.push(...groupAssignments);
    }

    return all;
  }
}
