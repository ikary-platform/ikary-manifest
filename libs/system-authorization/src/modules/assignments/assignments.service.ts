import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AccessLevel } from '../../interfaces/access-level.enum';
import type { ScopeType, TargetType } from '../../interfaces/authorization.types';
import { AuthorizationConfigService } from '../../config/authorization-config.service';
import { CodeNormalizerService } from '../../services/code-normalizer.service';
import { RegistryService } from '../../registry/registry.service';
import { GroupsService } from '../groups/groups.service';
import { RolesService } from '../roles/roles.service';
import { AssignmentsRepository } from './assignments.repository';
import { upsertPermissionAssignmentSchema } from './assignments.schemas';

@Injectable()
export class AssignmentsService {
  constructor(
    @Inject(AuthorizationConfigService) private readonly config: AuthorizationConfigService,
    @Inject(AssignmentsRepository) private readonly repository: AssignmentsRepository,
    @Inject(RegistryService) private readonly registry: RegistryService,
    @Inject(RolesService) private readonly roles: RolesService,
    @Inject(GroupsService) private readonly groups: GroupsService,
    @Inject(CodeNormalizerService) private readonly codeNormalizer: CodeNormalizerService,
  ) {}

  async upsertAssignment(input: {
    tenantId: string;
    workspaceId?: string | null;
    cellId?: string | null;
    targetType: TargetType;
    targetId: string;
    scopeType: ScopeType;
    scopeCode: string;
    accessLevel: AccessLevel;
  }) {
    const parsed = upsertPermissionAssignmentSchema.parse(input);

    if (!this.config.isTargetTypeAllowed(parsed.targetType)) {
      throw new ForbiddenException(`Target type ${parsed.targetType} is not enabled by assignmentLevel.`);
    }

    if (!this.config.isScopeTypeAllowed(parsed.scopeType)) {
      throw new ForbiddenException(`Scope type ${parsed.scopeType} is not enabled by mode.`);
    }

    const normalizedCode = this.codeNormalizer.normalizeScopeCode(parsed.scopeCode);

    const scopeExists = await this.registry.ensureScopeExists(parsed.scopeType, normalizedCode);
    if (!scopeExists) {
      throw new NotFoundException(`${parsed.scopeType} scope code ${normalizedCode} is not registered.`);
    }

    /* v8 ignore next */
    await this.ensureTargetExists(parsed.workspaceId ?? '', parsed.targetType, parsed.targetId);

    return this.repository.upsertAssignment({
      tenantId: parsed.tenantId,
      /* v8 ignore next 2 */
      workspaceId: parsed.workspaceId ?? null,
      cellId: 'cellId' in parsed ? ((parsed.cellId as string | null | undefined) ?? null) : null,
      targetType: parsed.targetType,
      targetId: parsed.targetId,
      scopeType: parsed.scopeType,
      scopeCode: normalizedCode,
      accessLevel: parsed.accessLevel,
    });
  }

  listCellPermissions(input: { tenantId: string; workspaceId: string; cellId: string }) {
    return this.repository.listByCell(input);
  }

  removeCellPermission(id: string) {
    return this.repository.removeAssignment(id);
  }

  removeWorkspacePermission(id: string, workspaceId: string) {
    return this.repository.removeAssignmentScoped({ id, workspaceId });
  }

  findAssignmentsForTarget(input: {
    workspaceId: string;
    cellId?: string;
    targetType: TargetType;
    targetIds: string[];
    scopeTypes: ScopeType[];
  }) {
    return this.repository.findByTargets(input);
  }

  removeAssignmentsForTarget(input: { targetType: TargetType; targetId: string }) {
    return this.repository.removeAssignmentsForTarget(input);
  }

  findTenantDomainAssignmentsForUser(input: { tenantId: string; userId: string }) {
    return this.repository.findTenantDomainAssignmentsForUser(input);
  }

  private async ensureTargetExists(workspaceId: string, targetType: TargetType, targetId: string): Promise<void> {
    if (targetType === 'USER') {
      const exists = await this.repository.userExists(targetId);
      if (!exists) {
        throw new NotFoundException(`Target user ${targetId} does not exist.`);
      }
      return;
    }

    if (targetType === 'ROLE') {
      const exists = await this.roles.existsInOrg(workspaceId, targetId);
      if (!exists) {
        throw new NotFoundException(`Target role ${targetId} does not exist in workspace.`);
      }
      return;
    }

    const exists = await this.groups.existsInOrg(workspaceId, targetId);
    if (!exists) {
      throw new NotFoundException(`Target group ${targetId} does not exist in workspace.`);
    }
  }
}
