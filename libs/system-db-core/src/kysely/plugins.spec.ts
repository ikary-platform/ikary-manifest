import { describe, it, expect } from 'vitest';
import { PostgresDialect } from 'kysely';
import { createDialect } from './plugins.js';

const BASE_OPTS = { maxPoolSize: 5, ssl: false, slowQueryThresholdMs: 0 } as const;

describe('createDialect', () => {
  it('returns a PostgresDialect for postgres:// connection string', () => {
    const dialect = createDialect({ ...BASE_OPTS, connectionString: 'postgres://localhost/db' });
    expect(dialect).toBeInstanceOf(PostgresDialect);
  });

  it('creates PostgresDialect with ssl=true without throwing', () => {
    expect(() =>
      createDialect({ ...BASE_OPTS, connectionString: 'postgres://localhost/db', ssl: true }),
    ).not.toThrow();
  });

  it('creates PostgresDialect with ssl=false without throwing', () => {
    expect(() =>
      createDialect({ ...BASE_OPTS, connectionString: 'postgres://localhost/db', ssl: false }),
    ).not.toThrow();
  });
});
