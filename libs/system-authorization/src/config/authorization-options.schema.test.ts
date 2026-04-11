import { describe, expect, it } from 'vitest';
import {
  authorizationModuleOptionsSchema,
  getAllowedScopeTypes,
  getAllowedTargetTypes,
} from './authorization-options.schema';

describe('getAllowedScopeTypes', () => {
  it('returns only FEATURE for "feature" mode', () => {
    expect(getAllowedScopeTypes('feature')).toEqual(['FEATURE']);
  });

  it('returns only DOMAIN for "domain" mode', () => {
    expect(getAllowedScopeTypes('domain')).toEqual(['DOMAIN']);
  });

  it('returns both FEATURE and DOMAIN for "both" mode', () => {
    expect(getAllowedScopeTypes('both')).toEqual(['FEATURE', 'DOMAIN']);
  });
});

describe('getAllowedTargetTypes', () => {
  it('returns only USER for "user" level', () => {
    expect(getAllowedTargetTypes('user')).toEqual(['USER']);
  });

  it('returns USER and ROLE for "user-role" level', () => {
    expect(getAllowedTargetTypes('user-role')).toEqual(['USER', 'ROLE']);
  });

  it('returns USER and GROUP for "user-group" level', () => {
    expect(getAllowedTargetTypes('user-group')).toEqual(['USER', 'GROUP']);
  });

  it('returns USER, ROLE, and GROUP for "user-role-group" level', () => {
    expect(getAllowedTargetTypes('user-role-group')).toEqual(['USER', 'ROLE', 'GROUP']);
  });
});

describe('authorizationModuleOptionsSchema', () => {
  const validDatabase = {
    connectionString: 'postgres://localhost:5432/authz',
  };

  it('parses a minimal valid config and applies defaults', () => {
    const result = authorizationModuleOptionsSchema.parse({ database: validDatabase });

    expect(result).toEqual({
      database: {
        connectionString: 'postgres://localhost:5432/authz',
        ssl: false,
        maxPoolSize: 20,
      },
      mode: 'both',
      assignmentLevel: 'user-role-group',
    });
  });

  it('parses a fully specified config without overriding values', () => {
    const input = {
      database: {
        connectionString: 'postgres://prod:5432/authz',
        ssl: true,
        maxPoolSize: 50,
      },
      mode: 'feature' as const,
      assignmentLevel: 'user' as const,
    };
    const result = authorizationModuleOptionsSchema.parse(input);

    expect(result).toEqual(input);
  });

  it('rejects an empty connectionString', () => {
    expect(() =>
      authorizationModuleOptionsSchema.parse({
        database: { connectionString: '' },
      }),
    ).toThrow();
  });

  it('rejects a missing database object', () => {
    expect(() => authorizationModuleOptionsSchema.parse({})).toThrow();
  });

  it('rejects an invalid mode value', () => {
    expect(() =>
      authorizationModuleOptionsSchema.parse({
        database: validDatabase,
        mode: 'invalid',
      }),
    ).toThrow();
  });

  it('rejects an invalid assignmentLevel value', () => {
    expect(() =>
      authorizationModuleOptionsSchema.parse({
        database: validDatabase,
        assignmentLevel: 'admin',
      }),
    ).toThrow();
  });

  it('rejects maxPoolSize below 1', () => {
    expect(() =>
      authorizationModuleOptionsSchema.parse({
        database: { ...validDatabase, maxPoolSize: 0 },
      }),
    ).toThrow();
  });

  it('rejects maxPoolSize above 100', () => {
    expect(() =>
      authorizationModuleOptionsSchema.parse({
        database: { ...validDatabase, maxPoolSize: 101 },
      }),
    ).toThrow();
  });

  it('rejects non-integer maxPoolSize', () => {
    expect(() =>
      authorizationModuleOptionsSchema.parse({
        database: { ...validDatabase, maxPoolSize: 5.5 },
      }),
    ).toThrow();
  });
});
