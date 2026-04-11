import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AuthorizationConfigService } from '../../config/authorization-config.service';
import { CodeNormalizerService } from '../../services/code-normalizer.service';
import { assignUserGroupSchema, createGroupSchema } from './groups.schemas';
import { GroupsRepository } from './groups.repository';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(AuthorizationConfigService) private readonly config: AuthorizationConfigService,
    @Inject(GroupsRepository) private readonly repository: GroupsRepository,
    @Inject(CodeNormalizerService) private readonly codeNormalizer: CodeNormalizerService,
  ) {}

  async createGroup(input: {
    tenantId: string;
    workspaceId: string;
    code: string;
    name: string;
    description?: string;
  }) {
    if (!this.config.includesGroupAssignments()) {
      throw new ForbiddenException('Group assignments are disabled by assignmentLevel.');
    }

    const parsed = createGroupSchema.parse(input);

    return this.repository.upsertGroup({
      tenantId: parsed.tenantId,
      workspaceId: parsed.workspaceId,
      code: this.codeNormalizer.normalizeScopeCode(parsed.code),
      name: parsed.name,
      description: parsed.description,
    });
  }

  async assignUserGroup(input: {
    tenantId: string;
    workspaceId: string;
    userId: string;
    groupId: string;
  }): Promise<void> {
    if (!this.config.includesGroupAssignments()) {
      throw new ForbiddenException('Group assignments are disabled by assignmentLevel.');
    }

    const parsed = assignUserGroupSchema.parse(input);
    await this.repository.assignUserGroup(parsed);
  }

  getGroupIdsForUser(workspaceId: string, userId: string): Promise<string[]> {
    return this.repository.getGroupIdsForUser(workspaceId, userId);
  }

  existsInOrg(workspaceId: string, groupId: string): Promise<boolean> {
    return this.repository.existsInOrg(workspaceId, groupId);
  }
}
