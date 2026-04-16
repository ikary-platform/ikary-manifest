import { describe, it, expect } from 'vitest';
import { ikaryConfigSchema } from './ikary-config.schema.js';

describe('ikaryConfigSchema', () => {
  it('applies empty defaults for an empty object', () => {
    const cfg = ikaryConfigSchema.parse({});
    expect(cfg.migrate?.packages).toEqual([]);
  });

  it('accepts a partial migrate section with packages only', () => {
    const cfg = ikaryConfigSchema.parse({
      migrate: { packages: ['@ikary/billing-core'] },
    });
    expect(cfg.migrate?.packages).toEqual(['@ikary/billing-core']);
  });

  it('accepts multiple packages', () => {
    const cfg = ikaryConfigSchema.parse({
      migrate: {
        packages: ['@ikary/billing-core', '@ikary/tenant-service', '@ikary/custom-analytics'],
      },
    });
    expect(cfg.migrate?.packages).toHaveLength(3);
  });

  it('rejects empty-string packages', () => {
    expect(() =>
      ikaryConfigSchema.parse({ migrate: { packages: [''] } }),
    ).toThrow();
  });

  it('rejects a non-array packages value', () => {
    expect(() =>
      ikaryConfigSchema.parse({ migrate: { packages: '@ikary/foo' } }),
    ).toThrow();
  });

  it('rejects unknown top-level keys only if strict mode is applied — loose by default', () => {
    // Our schema is loose at the top level; unknown keys pass through.
    // This is intentional — future CLI versions may add sections without
    // breaking existing config files.
    const cfg = ikaryConfigSchema.parse({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      futureSection: { enabled: true },
    } as any);
    expect(cfg.migrate?.packages).toEqual([]);
  });
});
