import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AuthorizationConfigService } from '../../config/authorization-config.service';
import { CodeNormalizerService } from '../../services/code-normalizer.service';
import { assignUserRoleSchema, createRoleSchema, unassignUserRoleSchema } from './roles.schemas';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(
    @Inject(AuthorizationConfigService) private readonly config: AuthorizationConfigService,
    @Inject(RolesRepository) private readonly repository: RolesRepository,
    @Inject(CodeNormalizerService) private readonly codeNormalizer: CodeNormalizerService,
  ) {}

  async createRole(input: { tenantId: string; workspaceId: string; code: string; name: string; description?: string }) {
    if (!this.config.includesRoleAssignments()) {
      throw new ForbiddenException('Role assignments are disabled by assignmentLevel.');
    }

    const parsed = createRoleSchema.parse(input);

    return this.repository.upsertRole({
      tenantId: parsed.tenantId,
      workspaceId: parsed.workspaceId,
      code: this.codeNormalizer.normalizeScopeCode(parsed.code),
      name: parsed.name,
      description: parsed.description,
    });
  }

  async assignUserRole(input: {
    tenantId: string;
    workspaceId?: string | null;
    userId: string;
    roleId: string;
  }): Promise<void> {
    if (!this.config.includesRoleAssignments()) {
      throw new ForbiddenException('Role assignments are disabled by assignmentLevel.');
    }

    const parsed = assignUserRoleSchema.parse(input);
    await this.repository.assignUserRole({
      tenantId: parsed.tenantId,
      workspaceId: parsed.workspaceId ?? null,
      userId: parsed.userId,
      roleId: parsed.roleId,
    });
  }

  async unassignUserRole(input: {
    tenantId: string;
    workspaceId?: string | null;
    userId: string;
    roleId: string;
  }): Promise<void> {
    if (!this.config.includesRoleAssignments()) {
      throw new ForbiddenException('Role assignments are disabled by assignmentLevel.');
    }

    const parsed = unassignUserRoleSchema.parse(input);
    await this.repository.unassignUserRole({
      tenantId: parsed.tenantId,
      workspaceId: parsed.workspaceId ?? null,
      userId: parsed.userId,
      roleId: parsed.roleId,
    });
  }

  async deleteRole(input: { tenantId: string; workspaceId: string; roleId: string }): Promise<boolean> {
    if (!this.config.includesRoleAssignments()) {
      throw new ForbiddenException('Role assignments are disabled by assignmentLevel.');
    }
    return this.repository.softDeleteRole(input);
  }

  findRoleByCode(tenantId: string, workspaceId: string, code: string) {
    return this.repository.findByCode(tenantId, workspaceId, this.codeNormalizer.normalizeScopeCode(code));
  }

  listByWorkspace(tenantId: string, workspaceId: string) {
    return this.repository.listByWorkspace(tenantId, workspaceId);
  }

  getRoleIdsForUser(workspaceId: string, userId: string): Promise<string[]> {
    return this.repository.getRoleIdsForUser(workspaceId, userId);
  }

  existsInOrg(workspaceId: string, roleId: string): Promise<boolean> {
    return this.repository.existsInOrg(workspaceId, roleId);
  }

  countActiveOwners(tenantId: string, workspaceId: string): Promise<number> {
    return this.repository.countActiveOwners(tenantId, workspaceId);
  }

  getRoleMembers(input: { tenantId: string; workspaceId: string; roleId: string }) {
    return this.repository.listMembersByRole(input);
  }
}
