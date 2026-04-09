import { describe, it, expect, vi } from 'vitest';
import { SqliteDialect, PostgresDialect } from 'kysely';
import { createDialect } from './plugins.js';

// Note: `createDialect` uses `createRequire` to load `pg` and `better-sqlite3`,
// which bypasses ESM module mocks. Tests verify dialect type and code-path execution.

const BASE_OPTS = { maxPoolSize: 5, ssl: false, slowQueryThresholdMs: 0 } as const;

describe('createDialect', () => {
  it('returns a SqliteDialect for sqlite:// connection string', () => {
    const dialect = createDialect({ ...BASE_OPTS, connectionString: 'sqlite://:memory:' });
    expect(dialect).toBeInstanceOf(SqliteDialect);
  });

  it('returns a PostgresDialect for postgres:// connection string', () => {
    const dialect = createDialect({ ...BASE_OPTS, connectionString: 'postgres://localhost/db' });
    expect(dialect).toBeInstanceOf(PostgresDialect);
  });

  it('creates PostgresDialect with ssl=true without throwing', () => {
    // Exercises the ssl: { rejectUnauthorized: false } branch
    expect(() =>
      createDialect({ ...BASE_OPTS, connectionString: 'postgres://localhost/db', ssl: true }),
    ).not.toThrow();
  });

  it('creates PostgresDialect with ssl=false without throwing', () => {
    // Exercises the ssl: undefined branch
    expect(() =>
      createDialect({ ...BASE_OPTS, connectionString: 'postgres://localhost/db', ssl: false }),
    ).not.toThrow();
  });
});
