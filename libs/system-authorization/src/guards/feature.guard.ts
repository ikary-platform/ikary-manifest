import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_FEATURE_KEY } from '../config/constants';
import { AccessLevel } from '../interfaces/access-level.enum';
import type { RequiredFeaturePermission } from '../decorators/require-feature.decorator';

@Injectable()
export class FeatureGuard implements CanActivate {
  private readonly reflector = new Reflector();

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredFeaturePermission | undefined>(REQUIRE_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      auth?: { featureScopes?: Record<string, number> };
      user?: { featureScopes?: Record<string, number> };
      authorizationScopes?: { featureScopes?: Record<string, number> };
    }>();

    const scopes =
      request.auth?.featureScopes ?? request.user?.featureScopes ?? request.authorizationScopes?.featureScopes ?? {};

    const actual = scopes[required.code] ?? AccessLevel.NONE;

    if (actual < required.level) {
      throw new ForbiddenException(
        `Insufficient feature scope for ${required.code}. Required ${required.level}, actual ${actual}.`,
      );
    }

    return true;
  }
}
