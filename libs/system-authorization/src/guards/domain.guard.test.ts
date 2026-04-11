import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DomainGuard } from './domain.guard';
import { AccessLevel } from '../interfaces/access-level.enum';
import { REQUIRE_DOMAIN_KEY } from '../config/constants';

function makeContext(request: Record<string, unknown>) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

function makeGuard(
  metadata: { code: string; level: AccessLevel } | undefined,
  authorizationService?: { getJwtScopes: ReturnType<typeof vi.fn> },
) {
  const service = authorizationService ?? { getJwtScopes: vi.fn() };
  const guard = new DomainGuard(service as any);
  (guard as any).reflector = {
    getAllAndOverride: (key: string, targets: unknown[]) => {
      expect(key).toBe(REQUIRE_DOMAIN_KEY);
      expect(targets).toHaveLength(2);
      return metadata;
    },
  };
  return { guard, service };
}

describe('DomainGuard', () => {
  it('allows when no metadata is set', async () => {
    const { guard } = makeGuard(undefined);
    const result = await guard.canActivate(makeContext({}));
    expect(result).toBe(true);
  });

  it('allows when isSystemAdmin is true', async () => {
    const { guard } = makeGuard({ code: 'USERS', level: AccessLevel.ADMIN });
    const ctx = makeContext({
      auth: { isSystemAdmin: true },
    });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('reads scopes from auth.domainScopes', async () => {
    const { guard } = makeGuard({ code: 'USERS', level: AccessLevel.VIEW });
    const ctx = makeContext({
      auth: { domainScopes: { USERS: AccessLevel.EDIT } },
    });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('reads scopes from user.domainScopes when auth.domainScopes is absent', async () => {
    const { guard } = makeGuard({ code: 'USERS', level: AccessLevel.VIEW });
    const ctx = makeContext({
      user: { domainScopes: { USERS: AccessLevel.ALL } },
    });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('reads scopes from authorizationScopes.domainScopes as last fallback', async () => {
    const { guard } = makeGuard({ code: 'USERS', level: AccessLevel.VIEW });
    const ctx = makeContext({
      authorizationScopes: { domainScopes: { USERS: AccessLevel.VIEW } },
    });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('prefers auth.domainScopes over user.domainScopes', async () => {
    const { guard } = makeGuard({ code: 'X', level: AccessLevel.EDIT });
    const ctx = makeContext({
      auth: { domainScopes: { X: AccessLevel.EDIT } },
      user: { domainScopes: { X: AccessLevel.NONE } },
    });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('falls back to DB resolution when no scopes are present on request', async () => {
    const service = {
      getJwtScopes: vi.fn().mockResolvedValue({
        domainScopes: { USERS: AccessLevel.ADMIN },
        featureScopes: {},
      }),
    };
    const { guard } = makeGuard({ code: 'USERS', level: AccessLevel.VIEW }, service);
    const ctx = makeContext({
      auth: { userId: 'u1', workspaceId: 'w1' },
    });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(service.getJwtScopes).toHaveBeenCalledWith('u1', 'w1');
  });

  it('does not call DB resolution when userId is missing', async () => {
    const service = {
      getJwtScopes: vi.fn(),
    };
    const { guard } = makeGuard({ code: 'USERS', level: AccessLevel.VIEW }, service);
    const ctx = makeContext({
      auth: { workspaceId: 'w1' },
    });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(service.getJwtScopes).not.toHaveBeenCalled();
  });

  it('does not call DB resolution when workspaceId is missing', async () => {
    const service = {
      getJwtScopes: vi.fn(),
    };
    const { guard } = makeGuard({ code: 'USERS', level: AccessLevel.VIEW }, service);
    const ctx = makeContext({
      auth: { userId: 'u1' },
    });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(service.getJwtScopes).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when actual level is below required', async () => {
    const { guard } = makeGuard({ code: 'USERS', level: AccessLevel.ADMIN });
    const ctx = makeContext({
      auth: { domainScopes: { USERS: AccessLevel.VIEW } },
    });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when code is missing from scopes', async () => {
    const { guard } = makeGuard({ code: 'MISSING', level: AccessLevel.VIEW });
    const ctx = makeContext({
      auth: { domainScopes: { OTHER: AccessLevel.ADMIN } },
    });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('defaults to AccessLevel.NONE when no scopes and no DB fallback', async () => {
    const { guard } = makeGuard({ code: 'ANY', level: AccessLevel.VIEW });
    const ctx = makeContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('includes scope details in the ForbiddenException message', async () => {
    const { guard } = makeGuard({ code: 'USERS', level: AccessLevel.ADMIN });
    const ctx = makeContext({
      auth: { domainScopes: { USERS: AccessLevel.VIEW } },
    });
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      `Insufficient domain scope for USERS. Required ${AccessLevel.ADMIN}, actual ${AccessLevel.VIEW}.`,
    );
  });

  it('allows when DB-resolved level meets the requirement', async () => {
    const service = {
      getJwtScopes: vi.fn().mockResolvedValue({
        domainScopes: { ORDERS: AccessLevel.EDIT },
        featureScopes: {},
      }),
    };
    const { guard } = makeGuard({ code: 'ORDERS', level: AccessLevel.EDIT }, service);
    const ctx = makeContext({
      auth: { userId: 'u1', workspaceId: 'w1' },
    });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('throws when DB-resolved level is insufficient', async () => {
    const service = {
      getJwtScopes: vi.fn().mockResolvedValue({
        domainScopes: { ORDERS: AccessLevel.VIEW },
        featureScopes: {},
      }),
    };
    const { guard } = makeGuard({ code: 'ORDERS', level: AccessLevel.ADMIN }, service);
    const ctx = makeContext({
      auth: { userId: 'u1', workspaceId: 'w1' },
    });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
