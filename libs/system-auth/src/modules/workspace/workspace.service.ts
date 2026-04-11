import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WorkspaceRepository } from './workspace.repository';
import type { Queryable } from '../../database/database.service';

@Injectable()
export class WorkspaceService {
  constructor(@Inject(WorkspaceRepository) private readonly workspaces: WorkspaceRepository) {}

  async createWorkspace(
    input: { tenantId: string; name: string; slug: string; description?: string | null; createdByUserId: string },
    client?: Queryable,
  ) {
    const existing = await this.workspaces.findBySlug(input.slug, client);
    if (existing && !existing.deleted_at) {
      throw new ConflictException('Workspace slug is already in use.');
    }

    return this.workspaces.create(input, client);
  }

  async getRequired(workspaceId: string, client?: Queryable) {
    const workspace = await this.workspaces.findById(workspaceId, client);
    if (!workspace || workspace.deleted_at) {
      throw new NotFoundException('Workspace was not found.');
    }

    return workspace;
  }
}
