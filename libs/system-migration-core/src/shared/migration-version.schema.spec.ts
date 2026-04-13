import { describe, it, expect } from 'vitest';
import {
  migrationFileSchema,
  migrationVersionSchema,
  migrationRunnerOptionsSchema,
  migrationStatusSchema,
} from './migration-version.schema.js';

describe('migrationFileSchema', () => {
  it('parses a valid file', () => {
    const result = migrationFileSchema.parse({ fileName: '001.sql', absolutePath: '/tmp/001.sql' });
    expect(result.fileName).toBe('001.sql');
    expect(result.absolutePath).toBe('/tmp/001.sql');
  });

  it('rejects missing fileName', () => {
    expect(() => migrationFileSchema.parse({ absolutePath: '/tmp/001.sql' })).toThrow();
  });

  it('rejects missing absolutePath', () => {
    expect(() => migrationFileSchema.parse({ fileName: '001.sql' })).toThrow();
  });
});

describe('migrationVersionSchema', () => {
  it('parses a valid version', () => {
    const result = migrationVersionSchema.parse({
      packageName: '@ikary/test',
      version: '0.1.0',
      versionDir: 'v0.1.0',
      files: [{ fileName: '001.sql', absolutePath: '/tmp/001.sql' }],
    });
    expect(result.version).toBe('0.1.0');
    expect(result.files).toHaveLength(1);
  });

  it('rejects missing packageName', () => {
    expect(() =>
      migrationVersionSchema.parse({
        version: '0.1.0',
        versionDir: 'v0.1.0',
        files: [],
      }),
    ).toThrow();
  });

  it('parses with empty files array', () => {
    const result = migrationVersionSchema.parse({
      packageName: '@ikary/test',
      version: '1.0.0',
      versionDir: 'v1.0.0',
      files: [],
    });
    expect(result.files).toHaveLength(0);
  });
});

describe('migrationRunnerOptionsSchema', () => {
  it('parses valid options', () => {
    const result = migrationRunnerOptionsSchema.parse({
      packageName: '@ikary/test',
      migrationsRoot: '/tmp/migrations',
    });
    expect(result.packageName).toBe('@ikary/test');
    expect(result.migrationsRoot).toBe('/tmp/migrations');
  });

  it('rejects missing packageName', () => {
    expect(() =>
      migrationRunnerOptionsSchema.parse({ migrationsRoot: '/tmp' }),
    ).toThrow();
  });

  it('rejects missing migrationsRoot', () => {
    expect(() =>
      migrationRunnerOptionsSchema.parse({ packageName: '@ikary/test' }),
    ).toThrow();
  });
});

describe('migrationStatusSchema', () => {
  it('parses valid status', () => {
    const result = migrationStatusSchema.parse({ applied: ['0.1.0'], pending: ['1.0.0'] });
    expect(result.applied).toEqual(['0.1.0']);
    expect(result.pending).toEqual(['1.0.0']);
  });

  it('parses empty arrays', () => {
    const result = migrationStatusSchema.parse({ applied: [], pending: [] });
    expect(result.applied).toHaveLength(0);
  });
});
