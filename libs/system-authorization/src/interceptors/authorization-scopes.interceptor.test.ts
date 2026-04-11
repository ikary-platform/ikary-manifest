import { describe, expect, it, vi } from 'vitest';
import { of, lastValueFrom } from 'rxjs';
import { AuthorizationScopesInterceptor } from './authorization-scopes.interceptor';
import { AccessLevel } from '../interfaces/access-level.enum';

function makeContext(request: Record<string, unknown>) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe('AuthorizationScopesInterceptor', () => {
  it('passes through when userId is missing', async () => {
    const service = { getJwtScopes: vi.fn() };
    const interceptor = new AuthorizationScopesInterceptor(service as any);
    const handler = { handle: () => of('result') };
    const request: Record<string, unknown> = { auth: { workspaceId: 'w1' } };

    const result = await lastValueFrom(interceptor.intercept(makeContext(request), handler));

    expect(result).toBe('result');
    expect(service.getJwtScopes).not.toHaveBeenCalled();
    expect(request.authorizationScopes).toBeUndefined();
  });

  it('passes through when workspaceId is missing', async () => {
    const service = { getJwtScopes: vi.fn() };
    const interceptor = new AuthorizationScopesInterceptor(service as any);
    const handler = { handle: () => of('result') };
    const request: Record<string, unknown> = { auth: { userId: 'u1' } };

    const result = await lastValueFrom(interceptor.intercept(makeContext(request), handler));

    expect(result).toBe('result');
    expect(service.getJwtScopes).not.toHaveBeenCalled();
    expect(request.authorizationScopes).toBeUndefined();
  });

  it('passes through when auth is entirely absent', async () => {
    const service = { getJwtScopes: vi.fn() };
    const interceptor = new AuthorizationScopesInterceptor(service as any);
    const handler = { handle: () => of('result') };
    const request: Record<string, unknown> = {};

    const result = await lastValueFrom(interceptor.intercept(makeContext(request), handler));

    expect(result).toBe('result');
    expect(service.getJwtScopes).not.toHaveBeenCalled();
  });

  it('reuses existing featureScopes from auth without calling service', async () => {
    const service = { getJwtScopes: vi.fn() };
    const interceptor = new AuthorizationScopesInterceptor(service as any);
    const handler = { handle: () => of('result') };
    const request: Record<string, unknown> = {
      auth: {
        userId: 'u1',
        workspaceId: 'w1',
        featureScopes: { BILLING: AccessLevel.VIEW },
      },
    };

    const result = await lastValueFrom(interceptor.intercept(makeContext(request), handler));

    expect(result).toBe('result');
    expect(service.getJwtScopes).not.toHaveBeenCalled();
    expect(request.authorizationScopes).toEqual({
      featureScopes: { BILLING: AccessLevel.VIEW },
      domainScopes: {},
    });
  });

  it('reuses existing domainScopes from auth without calling service', async () => {
    const service = { getJwtScopes: vi.fn() };
    const interceptor = new AuthorizationScopesInterceptor(service as any);
    const handler = { handle: () => of('result') };
    const request: Record<string, unknown> = {
      auth: {
        userId: 'u1',
        workspaceId: 'w1',
        domainScopes: { USERS: AccessLevel.ADMIN },
      },
    };

    const result = await lastValueFrom(interceptor.intercept(makeContext(request), handler));

    expect(result).toBe('result');
    expect(service.getJwtScopes).not.toHaveBeenCalled();
    expect(request.authorizationScopes).toEqual({
      featureScopes: {},
      domainScopes: { USERS: AccessLevel.ADMIN },
    });
  });

  it('reuses when both featureScopes and domainScopes exist on auth', async () => {
    const service = { getJwtScopes: vi.fn() };
    const interceptor = new AuthorizationScopesInterceptor(service as any);
    const handler = { handle: () => of('result') };
    const request: Record<string, unknown> = {
      auth: {
        userId: 'u1',
        workspaceId: 'w1',
        featureScopes: { F1: AccessLevel.ALL },
        domainScopes: { D1: AccessLevel.EDIT },
      },
    };

    const result = await lastValueFrom(interceptor.intercept(makeContext(request), handler));

    expect(result).toBe('result');
    expect(service.getJwtScopes).not.toHaveBeenCalled();
    expect(request.authorizationScopes).toEqual({
      featureScopes: { F1: AccessLevel.ALL },
      domainScopes: { D1: AccessLevel.EDIT },
    });
  });

  it('resolves scopes from DB and attaches to request when no scopes exist', async () => {
    const resolved = {
      featureScopes: { BILLING: AccessLevel.EDIT },
      domainScopes: { USERS: AccessLevel.VIEW },
    };
    const service = { getJwtScopes: vi.fn().mockResolvedValue(resolved) };
    const interceptor = new AuthorizationScopesInterceptor(service as any);
    const handler = { handle: () => of('result') };
    const request: Record<string, unknown> = {
      auth: { userId: 'u1', workspaceId: 'w1' },
    };

    const result = await lastValueFrom(interceptor.intercept(makeContext(request), handler));

    expect(result).toBe('result');
    expect(service.getJwtScopes).toHaveBeenCalledWith('u1', 'w1');
    expect(request.authorizationScopes).toEqual(resolved);
    expect((request.auth as any).featureScopes).toEqual(resolved.featureScopes);
    expect((request.auth as any).domainScopes).toEqual(resolved.domainScopes);
  });

  it('preserves existing auth properties when merging resolved scopes', async () => {
    const resolved = {
      featureScopes: { F: 1 },
      domainScopes: { D: 2 },
    };
    const service = { getJwtScopes: vi.fn().mockResolvedValue(resolved) };
    const interceptor = new AuthorizationScopesInterceptor(service as any);
    const handler = { handle: () => of('done') };
    const request: Record<string, unknown> = {
      auth: { userId: 'u1', workspaceId: 'w1', extra: 'keep' },
    };

    await lastValueFrom(interceptor.intercept(makeContext(request), handler));

    expect((request.auth as any).userId).toBe('u1');
    expect((request.auth as any).workspaceId).toBe('w1');
    expect((request.auth as any).extra).toBe('keep');
    expect((request.auth as any).featureScopes).toEqual(resolved.featureScopes);
    expect((request.auth as any).domainScopes).toEqual(resolved.domainScopes);
  });
});
