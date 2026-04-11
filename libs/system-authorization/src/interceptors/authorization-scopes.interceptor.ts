import { CallHandler, ExecutionContext, Inject, Injectable, type NestInterceptor } from '@nestjs/common';
import { from, type Observable, switchMap } from 'rxjs';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class AuthorizationScopesInterceptor implements NestInterceptor {
  constructor(@Inject(AuthorizationService) private readonly authorizationService: AuthorizationService) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      auth?: {
        userId?: string;
        workspaceId?: string;
        featureScopes?: Record<string, number>;
        domainScopes?: Record<string, number>;
      };
      authorizationScopes?: {
        featureScopes: Record<string, number>;
        domainScopes: Record<string, number>;
      };
    }>();

    const userId = request.auth?.userId;
    const workspaceId = request.auth?.workspaceId;

    if (!userId || !workspaceId) {
      return next.handle();
    }

    const hasScopes = Boolean(request.auth?.featureScopes || request.auth?.domainScopes);

    if (hasScopes) {
      request.authorizationScopes = {
        featureScopes: request.auth?.featureScopes ?? {},
        domainScopes: request.auth?.domainScopes ?? {},
      };

      return next.handle();
    }

    return from(this.authorizationService.getJwtScopes(userId, workspaceId)).pipe(
      switchMap((scopes) => {
        request.authorizationScopes = scopes;

        request.auth = {
          ...request.auth,
          featureScopes: scopes.featureScopes,
          domainScopes: scopes.domainScopes,
        };

        return next.handle();
      }),
    );
  }
}
