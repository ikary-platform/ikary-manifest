import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { AccessLevel } from '../interfaces/access-level.enum';
import type {
  AuthorizationPrincipal,
  JwtScopesPayload,
  PermissionAssignmentInput,
  ResolvedPermissions,
} from '../interfaces/authorization.types';
import { CodeNormalizerService } from './code-normalizer.service';
import { PermissionResolverService } from '../modules/authorization/permission-resolver.service';
import { RegistryService } from '../registry/registry.service';
import { PermissionNamespaceRegistry, type NamespacedPermission } from '../registry/permission-namespace.registry';
import { AssignmentsService } from '../modules/assignments/assignments.service';
import { GroupsService } from '../modules/groups/groups.service';
import { RolesService } from '../modules/roles/roles.service';

@Injectable()
export class AuthorizationService {
  constructor(
    @Inject(PermissionResolverService) private readonly resolver: PermissionResolverService,
    @Inject(RegistryService) private readonly registry: RegistryService,
    @Inject(PermissionNamespaceRegistry) private readonly permissionNamespaceRegistry: PermissionNamespaceRegistry,
    @Inject(AssignmentsService) private readonly assignments: AssignmentsService,
    @Inject(RolesService) private readonly roles: RolesService,
    @Inject(GroupsService) private readonly groups: GroupsService,
    @Inject(CodeNormalizerService) private readonly codeNormalizer: CodeNormalizerService,
  ) {}

  resolvePermissions(userId: string, workspaceId: string, cellId?: string): Promise<ResolvedPermissions> {
    return this.resolver.resolvePermissions(userId, workspaceId, cellId);
  }

  async getJwtScopes(userId: string, workspaceId: string): Promise<JwtScopesPayload> {
    const resolved = await this.resolver.resolvePermissions(userId, workspaceId);

    return {
      featureScopes: this.toNumericMap(resolved.featureScopes),
      domainScopes: this.toNumericMap(resolved.domainScopes),
    };
  }

  async canFeature(
    principal: AuthorizationPrincipal,
    featureCode: string,
    required: AccessLevel = AccessLevel.VIEW,
  ): Promise<boolean> {
    if (principal.isSystemAdmin === true) return true;
    const scopes = await this.getOrResolveScopes(principal);
    const normalizedCode = this.codeNormalizer.normalizeScopeCode(featureCode);
    const actual = scopes.featureScopes[normalizedCode] ?? AccessLevel.NONE;
    return actual >= required;
  }

  async canDomain(
    principal: AuthorizationPrincipal,
    domainCode: string,
    required: AccessLevel = AccessLevel.VIEW,
  ): Promise<boolean> {
    if (principal.isSystemAdmin === true) return true;
    const scopes = await this.getOrResolveScopes(principal);
    const normalizedCode = this.codeNormalizer.normalizeScopeCode(domainCode);
    const actual = scopes.domainScopes[normalizedCode] ?? AccessLevel.NONE;
    return actual >= required;
  }

  async getTenantDomainScopes(userId: string, tenantId: string): Promise<Record<string, number>> {
    const resolved = await this.resolver.resolveTenantDomainPermissions(userId, tenantId);
    return this.toNumericMap(resolved);
  }

  async canDomainInTenant(
    principal: Pick<AuthorizationPrincipal, 'userId' | 'tenantId' | 'domainScopes' | 'isSystemAdmin'>,
    domainCode: string,
    required: AccessLevel = AccessLevel.VIEW,
  ): Promise<boolean> {
    if (!principal.tenantId) {
      return false;
    }

    if (principal.isSystemAdmin === true) return true;

    const scopes = principal.domainScopes ?? (await this.getTenantDomainScopes(principal.userId, principal.tenantId));
    const normalizedCode = this.codeNormalizer.normalizeScopeCode(domainCode);
    const actual = scopes[normalizedCode] ?? AccessLevel.NONE;
    return actual >= required;
  }

  registerFeature(code: string, description?: string): Promise<void> {
    return this.registry.registerFeature(code, description);
  }

  registerDomain(code: string, description?: string): Promise<void> {
    return this.registry.registerDomain(code, description);
  }

  setupAuthorization(input: { features?: string[]; domains?: string[] }): Promise<void> {
    return this.registry.setupAuthorization(input);
  }

  registerNamespacedPermissions(permissions: NamespacedPermission[]): Promise<void> {
    return this.permissionNamespaceRegistry.registerPermissions(permissions);
  }

  assignPermission(input: PermissionAssignmentInput) {
    return this.assignments.upsertAssignment(input);
  }

  listCellPermissions(input: { tenantId: string; workspaceId: string; cellId: string }) {
    return this.assignments.listCellPermissions(input);
  }

  listRolePermissions(input: { workspaceId: string; roleId: string }) {
    return this.assignments.findAssignmentsForTarget({
      workspaceId: input.workspaceId,
      targetType: 'ROLE',
      targetIds: [input.roleId],
      scopeTypes: ['FEATURE', 'DOMAIN'],
    });
  }

  removeCellPermission(id: string) {
    return this.assignments.removeCellPermission(id);
  }

  removeWorkspacePermission(id: string, workspaceId: string) {
    return this.assignments.removeWorkspacePermission(id, workspaceId);
  }

  createRole(input: { tenantId: string; workspaceId: string; code: string; name: string; description?: string }) {
    return this.roles.createRole(input);
  }

  async deleteRole(input: { tenantId: string; workspaceId: string; roleId: string }): Promise<boolean> {
    const deleted = await this.roles.deleteRole(input);
    if (deleted) {
      await this.assignments.removeAssignmentsForTarget({ targetType: 'ROLE', targetId: input.roleId });
    }
    return deleted;
  }

  async assertNotLastOwner(tenantId: string, workspaceId: string, reason: string): Promise<void> {
    const ownerCount = await this.countActiveOwners(tenantId, workspaceId);
    if (ownerCount <= 1) {
      throw new UnprocessableEntityException({ code: 'LAST_OWNER_PROTECTED', message: reason });
    }
  }

  createGroup(input: { tenantId: string; workspaceId: string; code: string; name: string; description?: string }) {
    return this.groups.createGroup(input);
  }

  assignUserRole(input: { tenantId: string; workspaceId?: string | null; userId: string; roleId: string }) {
    return this.roles.assignUserRole(input);
  }

  unassignUserRole(input: { tenantId: string; workspaceId?: string | null; userId: string; roleId: string }) {
    return this.roles.unassignUserRole(input);
  }

  findRoleByCode(tenantId: string, workspaceId: string, code: string) {
    return this.roles.findRoleByCode(tenantId, workspaceId, code);
  }

  listRoles(tenantId: string, workspaceId: string) {
    return this.roles.listByWorkspace(tenantId, workspaceId);
  }

  countActiveOwners(tenantId: string, workspaceId: string) {
    return this.roles.countActiveOwners(tenantId, workspaceId);
  }

  getRoleMembers(tenantId: string, workspaceId: string, roleId: string) {
    return this.roles.getRoleMembers({ tenantId, workspaceId, roleId });
  }

  async getRoleScopeMatrix(
    workspaceId: string,
    roleId: string,
  ): Promise<
    Array<{
      scopeType: 'FEATURE' | 'DOMAIN';
      scopeCode: string;
      description: string | null;
      accessLevel: number;
      permissionId: string | null;
    }>
  > {
    const [features, domains, assignments] = await Promise.all([
      this.registry.listFeatures(),
      this.registry.listDomains(),
      this.assignments.findAssignmentsForTarget({
        workspaceId,
        targetType: 'ROLE',
        targetIds: [roleId],
        scopeTypes: ['FEATURE', 'DOMAIN'],
      }),
    ]);

    const assignmentMap = new Map(assignments.map((a) => [`${a.scope_type}:${a.scope_code}`, a]));

    const featureRows = features.map((f) => {
      const assignment = assignmentMap.get(`FEATURE:${f.code}`);
      return {
        scopeType: 'FEATURE' as const,
        scopeCode: f.code,
        description: f.description,
        accessLevel: assignment?.access_level ?? 0,
        permissionId: assignment?.id ?? null,
      };
    });

    const domainRows = domains.map((d) => {
      const assignment = assignmentMap.get(`DOMAIN:${d.code}`);
      return {
        scopeType: 'DOMAIN' as const,
        scopeCode: d.code,
        description: d.description,
        accessLevel: assignment?.access_level ?? 0,
        permissionId: assignment?.id ?? null,
      };
    });

    return [...featureRows, ...domainRows];
  }

  assignUserGroup(input: { tenantId: string; workspaceId: string; userId: string; groupId: string }) {
    return this.groups.assignUserGroup(input);
  }

  private async getOrResolveScopes(principal: AuthorizationPrincipal): Promise<JwtScopesPayload> {
    if (principal.featureScopes || principal.domainScopes) {
      return {
        featureScopes: principal.featureScopes ?? {},
        domainScopes: principal.domainScopes ?? {},
      };
    }

    const resolved = await this.resolver.resolvePermissions(principal.userId, principal.workspaceId, principal.cellId);
    return {
      featureScopes: this.toNumericMap(resolved.featureScopes),
      domainScopes: this.toNumericMap(resolved.domainScopes),
    };
  }

  private toNumericMap(input: Record<string, AccessLevel>): Record<string, number> {
    const output: Record<string, number> = {};

    for (const [key, value] of Object.entries(input)) {
      output[key] = Number(value);
    }

    return output;
  }
}
