import { CallHandler, ExecutionContext, Inject, Injectable, type NestInterceptor } from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuditService } from '../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@Inject(AuditService) private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{
      method?: string;
      path?: string;
      headers?: Record<string, string | string[] | undefined>;
      auth?: { userId: string; workspaceId: string };
      workspaceId?: string;
      params?: Record<string, string>;
      ip?: string;
      route?: { path?: string };
    }>();
    const response = http.getResponse<{ statusCode?: number }>();

    const workspaceId = request.workspaceId ?? request.auth?.workspaceId;
    if (!workspaceId) {
      return next.handle();
    }

    const actorUserId = request.auth?.userId;
    const action = `${request.method ?? 'UNKNOWN'} ${request.route?.path ?? request.path ?? ''}`.trim();
    const resourceType = context.getClass().name;
    const resourceId = request.params?.id;
    const requestIdHeader = request.headers?.['x-request-id'];
    const rawRequestId = Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader;
    const requestId = this.normalizeUuid(rawRequestId);
    const userAgentHeader = request.headers?.['user-agent'];
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader;

    return next.handle().pipe(
      tap(() => {
        void this.audit.log({
          workspaceId,
          actorUserId,
          action,
          resourceType,
          resourceId,
          httpMethod: request.method,
          requestPath: request.path,
          ipAddress: request.ip,
          userAgent,
          requestId,
          statusCode: response.statusCode,
          metadata: {},
        });
      }),
      catchError((error: unknown) => {
        const normalized = error as { status?: number; message?: string };
        void this.audit.log({
          workspaceId,
          actorUserId,
          action,
          resourceType,
          resourceId,
          httpMethod: request.method,
          requestPath: request.path,
          ipAddress: request.ip,
          userAgent,
          requestId,
          statusCode: typeof normalized.status === 'number' ? normalized.status : 500,
          metadata: {
            error: normalized.message ?? 'unknown_error',
          },
        });

        return throwError(() => error);
      }),
    );
  }

  private normalizeUuid(value?: string): string | undefined {
    if (!value) {
      return undefined;
    }

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(value) ? value : undefined;
  }
}
