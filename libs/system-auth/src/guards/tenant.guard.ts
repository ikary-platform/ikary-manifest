import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TenantGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      auth?: { tenantId?: string; userId?: string; isSystemAdmin?: boolean };
      tenantId?: string;
    }>();

    const rawHeader = request.headers['x-tenant-id'];
    const tenantId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required.');
    }

    request.tenantId = tenantId;

    if (request.auth?.tenantId && request.auth.tenantId !== tenantId) {
      throw new ForbiddenException('Token tenant does not match x-tenant-id header.');
    }

    // System admins are platform operators — not tenant members, bypass membership check.
    if (request.auth?.isSystemAdmin) {
      return true;
    }

    const userId = request.auth?.userId;
    if (userId) {
      const member = await this.db.db
        .selectFrom('tenant_members')
        .select('status')
        .where('tenant_id', '=', tenantId)
        .where('user_id', '=', userId)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      if (!member || member.status === 'suspended' || member.status === 'revoked') {
        throw new ForbiddenException('TENANT_ACCESS_REVOKED');
      }
    }

    return true;
  }
}
