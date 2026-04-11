import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../../database/database.service';
import type { AuthDatabaseSchema } from '../../database/schema';
import type { AuditLogCreateInput } from './audit.types';

@Injectable()
export class AuditRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private executor(client?: Queryable<AuthDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async insert(input: AuditLogCreateInput, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .insertInto('audit_logs')
      .values({
        workspace_id: input.workspaceId,
        actor_user_id: input.actorUserId ?? null,
        action: input.action,
        resource_type: input.resourceType,
        resource_id: input.resourceId ?? null,
        http_method: input.httpMethod ?? null,
        request_path: input.requestPath ?? null,
        ip_address: input.ipAddress ?? null,
        user_agent: input.userAgent ?? null,
        request_id: input.requestId ?? null,
        status_code: input.statusCode ?? null,
        metadata: input.metadata ?? {},
      })
      .execute();
  }
}
