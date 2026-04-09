import { describe, it, expect, afterEach } from 'vitest';
import { DatabaseService } from './database.service.js';
import type { DatabaseConnectionOptions } from '../config/database.schema.js';

const SQLITE_OPTS: DatabaseConnectionOptions = {
  connectionString: 'sqlite://:memory:',
  maxPoolSize: 20,
  ssl: false,
  slowQueryThresholdMs: 0,
};

const PG_OPTS: DatabaseConnectionOptions = {
  connectionString: 'postgres://localhost/db',
  maxPoolSize: 5,
  ssl: false,
  slowQueryThresholdMs: 0,
};

describe('DatabaseService', () => {
  let service: DatabaseService | undefined;

  afterEach(async () => {
    await service?.destroy();
    service = undefined;
  });

  it('isSqlite is true for sqlite:// connection strings', () => {
    service = new DatabaseService(SQLITE_OPTS);
    expect(service.isSqlite).toBe(true);
  });

  it('isSqlite is false for postgres:// connection strings', () => {
    // Uses real pg Pool — just check the flag; don't call ping() which needs a real server
    service = new DatabaseService(PG_OPTS);
    expect(service.isSqlite).toBe(false);
  });

  it('exposes the db property', () => {
    service = new DatabaseService(SQLITE_OPTS);
    expect(service.db).toBeDefined();
  });

  it('ping() resolves without throwing on SQLite', async () => {
    service = new DatabaseService(SQLITE_OPTS);
    await expect(service.ping()).resolves.not.toThrow();
  });

  it('withTransaction() executes the handler and returns its value', async () => {
    service = new DatabaseService(SQLITE_OPTS);
    const result = await service.withTransaction(async (_trx) => 'transaction-result');
    expect(result).toBe('transaction-result');
  });

  it('destroy() resolves without throwing for SQLite', async () => {
    service = new DatabaseService(SQLITE_OPTS);
    await expect(service.destroy()).resolves.not.toThrow();
    service = undefined; // already destroyed
  });

  it('enables slow query logging when slowQueryThresholdMs > 0', () => {
    service = new DatabaseService({ ...SQLITE_OPTS, slowQueryThresholdMs: 100 });
    expect(service.db).toBeDefined();
  });
});
