import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the raw `ikary_sso` cookie value from the incoming HTTP request.
 *
 * Reads the raw `Cookie` header directly — no `cookie-parser` middleware required.
 * Returns `null` when the cookie is absent or has an empty value.
 */
export const SsoCookie = createParamDecorator((_: unknown, ctx: ExecutionContext): string | null => {
  const req = ctx.switchToHttp().getRequest<{ headers?: { cookie?: string } }>();
  const header = req.headers?.cookie;
  if (!header) return null;

  for (const segment of header.split(';')) {
    const eqAt = segment.indexOf('=');
    if (eqAt === -1) continue;
    if (segment.slice(0, eqAt).trim() === 'ikary_sso') {
      return segment.slice(eqAt + 1).trim() || null;
    }
  }

  return null;
});
