import { describe, it, expect } from 'vitest';
import { RequireQuota, type LicenseQuotaResource } from './require-quota.decorator';
import { REQUIRE_QUOTA_KEY } from '../config/constants';

describe('RequireQuota', () => {
  function getMetadata(decorator: ReturnType<typeof RequireQuota>): string {
    const metadata: Record<string, unknown> = {};
    (decorator as any)({ constructor: {} }, undefined, {
      value: {},
      ...Object.defineProperty({}, 'value', { value: {} }),
    });
    // Use Reflect to get metadata
    const target = class {};
    decorator(target, undefined as any, undefined as any);
    return Reflect.getMetadata(REQUIRE_QUOTA_KEY, target);
  }

  it('sets metadata for "cell" resource', () => {
    const target = class {};
    RequireQuota('cell')(target, undefined as any, undefined as any);
    expect(Reflect.getMetadata(REQUIRE_QUOTA_KEY, target)).toBe('cell');
  });

  it('sets metadata for "workspace" resource', () => {
    const target = class {};
    RequireQuota('workspace')(target, undefined as any, undefined as any);
    expect(Reflect.getMetadata(REQUIRE_QUOTA_KEY, target)).toBe('workspace');
  });

  it('sets metadata for "user" resource', () => {
    const target = class {};
    RequireQuota('user')(target, undefined as any, undefined as any);
    expect(Reflect.getMetadata(REQUIRE_QUOTA_KEY, target)).toBe('user');
  });
});
