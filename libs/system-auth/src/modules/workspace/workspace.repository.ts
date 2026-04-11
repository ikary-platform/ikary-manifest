import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../../database/database.service';
import type { AuthDatabaseSchema } from '../../database/schema';
import type { WorkspaceRecord } from './workspace.types';

@Injectable()
export class WorkspaceRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private executor(client?: Queryable<AuthDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async create(
    params: { tenantId: string; name: string; slug: string; description?: string | null; createdByUserId: string },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<WorkspaceRecord> {
    return this.executor(client)
      .insertInto('workspaces')
      .values({
        id: randomUUID(),
        tenant_id: params.tenantId,
        name: params.name,
        slug: params.slug.toLowerCase(),
        description: params.description ?? null,
        created_by_user_id: params.createdByUserId,
      })
      .returning(['id', 'tenant_id', 'name', 'slug', 'description', 'created_by_user_id', 'deleted_at'])
      .executeTakeFirstOrThrow();
  }

  async findById(workspaceId: string, client?: Queryable<AuthDatabaseSchema>): Promise<WorkspaceRecord | null> {
    return (
      (await this.executor(client)
        .selectFrom('workspaces')
        .select(['id', 'tenant_id', 'name', 'slug', 'description', 'created_by_user_id', 'deleted_at'])
        .where('id', '=', workspaceId)
        .executeTakeFirst()) ?? null
    );
  }

  async findBySlug(slug: string, client?: Queryable<AuthDatabaseSchema>): Promise<WorkspaceRecord | null> {
    return (
      (await this.executor(client)
        .selectFrom('workspaces')
        .select(['id', 'tenant_id', 'name', 'slug', 'description', 'created_by_user_id', 'deleted_at'])
        .where('slug', 'like', slug)
        .executeTakeFirst()) ?? null
    );
  }
}
