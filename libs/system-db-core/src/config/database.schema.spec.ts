import { describe, it, expect } from 'vitest';
import { databaseConnectionOptionsSchema } from './database.schema.js';

describe('databaseConnectionOptionsSchema', () => {
  it('accepts a valid SQLite memory connection string', () => {
    const result = databaseConnectionOptionsSchema.parse({
      connectionString: 'sqlite://:memory:',
    });
    expect(result.connectionString).toBe('sqlite://:memory:');
    expect(result.maxPoolSize).toBe(20);
    expect(result.ssl).toBe(false);
    expect(result.slowQueryThresholdMs).toBe(0);
  });

  it('accepts a valid PostgreSQL connection string', () => {
    const result = databaseConnectionOptionsSchema.parse({
      connectionString: 'postgres://user:pass@localhost:5432/db',
    });
    expect(result.connectionString).toBe('postgres://user:pass@localhost:5432/db');
  });

  it('applies defaults for omitted optional fields', () => {
    const result = databaseConnectionOptionsSchema.parse({
      connectionString: 'sqlite://:memory:',
    });
    expect(result.maxPoolSize).toBe(20);
    expect(result.ssl).toBe(false);
    expect(result.slowQueryThresholdMs).toBe(0);
  });

  it('accepts custom values for optional fields', () => {
    const result = databaseConnectionOptionsSchema.parse({
      connectionString: 'postgres://localhost/db',
      maxPoolSize: 10,
      ssl: true,
      slowQueryThresholdMs: 500,
    });
    expect(result.maxPoolSize).toBe(10);
    expect(result.ssl).toBe(true);
    expect(result.slowQueryThresholdMs).toBe(500);
  });

  it('rejects an empty connection string', () => {
    expect(() =>
      databaseConnectionOptionsSchema.parse({ connectionString: '' }),
    ).toThrow();
  });

  it('rejects a missing connection string', () => {
    expect(() => databaseConnectionOptionsSchema.parse({})).toThrow();
  });

  it('rejects maxPoolSize of 0 (must be positive)', () => {
    expect(() =>
      databaseConnectionOptionsSchema.parse({
        connectionString: 'sqlite://:memory:',
        maxPoolSize: 0,
      }),
    ).toThrow();
  });

  it('rejects a non-integer maxPoolSize', () => {
    expect(() =>
      databaseConnectionOptionsSchema.parse({
        connectionString: 'sqlite://:memory:',
        maxPoolSize: 1.5,
      }),
    ).toThrow();
  });

  it('rejects a negative slowQueryThresholdMs', () => {
    expect(() =>
      databaseConnectionOptionsSchema.parse({
        connectionString: 'sqlite://:memory:',
        slowQueryThresholdMs: -1,
      }),
    ).toThrow();
  });
});
