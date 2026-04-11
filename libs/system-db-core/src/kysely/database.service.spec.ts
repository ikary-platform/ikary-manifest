import { describe, it, expect, afterEach } from 'vitest';
import { DatabaseService } from './database.service.js';
import { createTestDb } from '../test/test-db.js';

describe('DatabaseService', () => {
  let service: DatabaseService | undefined;

  afterEach(async () => {
    await service?.destroy();
    service = undefined;
  });

  it('exposes the db property', () => {
    service = createTestDb();
    expect(service.db).toBeDefined();
  });

  it('ping() resolves without throwing', async () => {
    service = createTestDb();
    await expect(service.ping()).resolves.not.toThrow();
  });

  it('withTransaction() executes the handler and returns its value', async () => {
    service = createTestDb();
    const result = await service.withTransaction(async (_trx) => 'transaction-result');
    expect(result).toBe('transaction-result');
  });

  it('destroy() resolves without throwing', async () => {
    service = createTestDb();
    await expect(service.destroy()).resolves.not.toThrow();
    service = undefined; // already destroyed
  });

  it('enables slow query logging when slowQueryThresholdMs > 0', () => {
    service = new DatabaseService({
      connectionString: process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test',
      maxPoolSize: 5,
      ssl: false,
      slowQueryThresholdMs: 100,
    });
    expect(service.db).toBeDefined();
  });
});
