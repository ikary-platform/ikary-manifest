import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../database/database.service';
import type { AuthDatabaseSchema } from '../database/schema';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AUTH_ROUTE_SCOPE_KEY } from '../config/constants';
import type { AuthRouteScope } from '../decorators/require-auth-scope.decorator';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  private readonly reflector = new Reflector();

  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const routeScope =
      this.reflector.getAllAndOverride<AuthRouteScope | undefined>(AUTH_ROUTE_SCOPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'WORKSPACE';

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      auth?: { workspaceId?: string; tenantId?: string; userId?: string; isSystemAdmin?: boolean };
      workspaceId?: string;
    }>();

    const rawHeader = request.headers['x-workspace-id'];
    const workspaceId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    if (!workspaceId && routeScope === 'WORKSPACE') {
      throw new BadRequestException('x-workspace-id header is required.');
    }

    if (workspaceId) {
      request.workspaceId = workspaceId;
    }

    if (workspaceId && request.auth?.workspaceId && request.auth.workspaceId !== workspaceId) {
      throw new ForbiddenException('Token workspace does not match x-workspace-id header.');
    }

    const tenantId = request.auth?.tenantId;
    if (tenantId) {
      const tenant = await this.executor()
        .selectFrom('tenants')
        .select(['id', 'status', 'deleted_at'])
        .where('id', '=', tenantId)
        .executeTakeFirst();

      if (!tenant || tenant.deleted_at || tenant.status !== 'ACTIVE') {
        throw new ForbiddenException({
          code: 'TENANT_DISABLED',
          message: 'This tenant is disabled.',
        });
      }
    }

    // System admins are platform operators — bypass workspace membership check.
    if (request.auth?.isSystemAdmin) {
      return true;
    }

    if (routeScope === 'TENANT') {
      return true;
    }

    const userId = request.auth?.userId;
    if (userId && workspaceId) {
      const member = await this.executor()
        .selectFrom('workspace_members')
        .select('status')
        .where('workspace_id', '=', workspaceId)
        .where('user_id', '=', userId)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      if (!member || member.status === 'suspended') {
        throw new ForbiddenException('WORKSPACE_ACCESS_SUSPENDED');
      }
    }

    return true;
  }

  private executor(client?: Queryable<AuthDatabaseSchema>) {
    return client ?? this.db.db;
  }
}
