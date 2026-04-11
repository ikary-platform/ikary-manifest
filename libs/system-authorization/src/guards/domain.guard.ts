import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_DOMAIN_KEY } from '../config/constants';
import { AccessLevel } from '../interfaces/access-level.enum';
import type { RequiredDomainPermission } from '../decorators/require-domain.decorator';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class DomainGuard implements CanActivate {
  private readonly reflector = new Reflector();

  constructor(@Inject(AuthorizationService) private readonly authorization: AuthorizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredDomainPermission | undefined>(REQUIRE_DOMAIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      auth?: {
        userId?: string;
        workspaceId?: string;
        isSystemAdmin?: boolean;
        domainScopes?: Record<string, number>;
      };
      user?: { domainScopes?: Record<string, number> };
      authorizationScopes?: { domainScopes?: Record<string, number> };
    }>();

    if (request.auth?.isSystemAdmin) {
      return true;
    }

    let domainScopes: Record<string, number> | undefined =
      request.auth?.domainScopes ?? request.user?.domainScopes ?? request.authorizationScopes?.domainScopes;

    if (!domainScopes) {
      const userId = request.auth?.userId;
      const workspaceId = request.auth?.workspaceId;
      if (userId && workspaceId) {
        const resolved = await this.authorization.getJwtScopes(userId, workspaceId);
        domainScopes = resolved.domainScopes;
      }
    }

    const actual = (domainScopes ?? {})[required.code] ?? AccessLevel.NONE;

    if (actual < required.level) {
      throw new ForbiddenException(
        `Insufficient domain scope for ${required.code}. Required ${required.level}, actual ${actual}.`,
      );
    }

    return true;
  }
}
