import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { FeatureGuard } from './feature.guard';
import { AccessLevel } from '../interfaces/access-level.enum';
import { REQUIRE_FEATURE_KEY } from '../config/constants';

function makeContext(request: Record<string, unknown>) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

function makeGuard(metadata: { code: string; level: AccessLevel } | undefined) {
  const guard = new FeatureGuard();
  // Override the reflector to return controlled metadata
  (guard as any).reflector = {
    getAllAndOverride: (key: string, targets: unknown[]) => {
      expect(key).toBe(REQUIRE_FEATURE_KEY);
      expect(targets).toHaveLength(2);
      return metadata;
    },
  };
  return guard;
}

describe('FeatureGuard', () => {
  it('allows when no metadata is set', () => {
    const guard = makeGuard(undefined);
    const result = guard.canActivate(makeContext({}));
    expect(result).toBe(true);
  });

  it('throws ForbiddenException when actual level is below required', () => {
    const guard = makeGuard({ code: 'BILLING', level: AccessLevel.EDIT });
    const ctx = makeContext({
      auth: { featureScopes: { BILLING: AccessLevel.VIEW } },
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('allows when actual level meets the required level', () => {
    const guard = makeGuard({ code: 'BILLING', level: AccessLevel.VIEW });
    const ctx = makeContext({
      auth: { featureScopes: { BILLING: AccessLevel.VIEW } },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows when actual level exceeds the required level', () => {
    const guard = makeGuard({ code: 'BILLING', level: AccessLevel.VIEW });
    const ctx = makeContext({
      auth: { featureScopes: { BILLING: AccessLevel.ADMIN } },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('reads scopes from auth.featureScopes', () => {
    const guard = makeGuard({ code: 'REPORTS', level: AccessLevel.VIEW });
    const ctx = makeContext({
      auth: { featureScopes: { REPORTS: AccessLevel.EDIT } },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('reads scopes from user.featureScopes when auth is absent', () => {
    const guard = makeGuard({ code: 'REPORTS', level: AccessLevel.VIEW });
    const ctx = makeContext({
      user: { featureScopes: { REPORTS: AccessLevel.ALL } },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('reads scopes from authorizationScopes.featureScopes as last fallback', () => {
    const guard = makeGuard({ code: 'REPORTS', level: AccessLevel.VIEW });
    const ctx = makeContext({
      authorizationScopes: { featureScopes: { REPORTS: AccessLevel.VIEW } },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('prefers auth.featureScopes over user.featureScopes', () => {
    const guard = makeGuard({ code: 'X', level: AccessLevel.EDIT });
    const ctx = makeContext({
      auth: { featureScopes: { X: AccessLevel.EDIT } },
      user: { featureScopes: { X: AccessLevel.NONE } },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('prefers user.featureScopes over authorizationScopes.featureScopes', () => {
    const guard = makeGuard({ code: 'X', level: AccessLevel.EDIT });
    const ctx = makeContext({
      auth: {},
      user: { featureScopes: { X: AccessLevel.EDIT } },
      authorizationScopes: { featureScopes: { X: AccessLevel.NONE } },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('defaults to AccessLevel.NONE when code is missing from scopes', () => {
    const guard = makeGuard({ code: 'MISSING', level: AccessLevel.VIEW });
    const ctx = makeContext({
      auth: { featureScopes: { OTHER: AccessLevel.ADMIN } },
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('defaults to empty scopes when no scope source is present', () => {
    const guard = makeGuard({ code: 'ANY', level: AccessLevel.VIEW });
    const ctx = makeContext({});
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('includes scope details in the ForbiddenException message', () => {
    const guard = makeGuard({ code: 'BILLING', level: AccessLevel.ADMIN });
    const ctx = makeContext({
      auth: { featureScopes: { BILLING: AccessLevel.VIEW } },
    });
    expect(() => guard.canActivate(ctx)).toThrow(
      `Insufficient feature scope for BILLING. Required ${AccessLevel.ADMIN}, actual ${AccessLevel.VIEW}.`,
    );
  });
});
