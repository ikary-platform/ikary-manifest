import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentAuthValue {
  userId: string;
  tenantId: string;
  workspaceId?: string;
  isSystemAdmin?: boolean;
}

export const CurrentAuth = createParamDecorator<keyof CurrentAuthValue | undefined>((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ auth?: CurrentAuthValue }>();
  if (!request.auth) {
    return undefined;
  }

  return data ? request.auth[data] : request.auth;
});
