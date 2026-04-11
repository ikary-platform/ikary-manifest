import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Queryable } from '../../database/database.service';
import { WorkspaceMembershipRepository } from './workspace-membership.repository';
import type { UserWorkspaceRecord } from './workspace-membership.types';

@Injectable()
export class WorkspaceMembershipService {
  constructor(@Inject(WorkspaceMembershipRepository) private readonly memberships: WorkspaceMembershipRepository) {}

  async createMembership(input: { tenantId: string; workspaceId: string; userId: string }, client?: Queryable) {
    return this.memberships.create(input, client);
  }

  async getRequiredActiveMembership(workspaceId: string, userId: string, client?: Queryable) {
    const membership = await this.memberships.findActive(workspaceId, userId, client);
    if (!membership) {
      throw new UnauthorizedException('User does not have an active membership in workspace.');
    }

    return membership;
  }

  listActiveWorkspacesForUser(userId: string, client?: Queryable): Promise<UserWorkspaceRecord[]> {
    return this.memberships.listActiveWorkspacesForUser(userId, client);
  }
}
