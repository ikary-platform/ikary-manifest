import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema, sql } from '@ikary/system-db-core';
import { MigrationTracker, SCHEMA_VERSIONS_TABLE } from './migration-tracker.js';

const TEST_DB_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test';

function createDb(): DatabaseService {
  return new DatabaseService(
    databaseConnectionOptionsSchema.parse({ connectionString: TEST_DB_URL }),
  );
}

describe('MigrationTracker', () => {
  let db: DatabaseService;
  let tracker: MigrationTracker;

  beforeEach(() => {
    db = createDb();
    tracker = new MigrationTracker(db);
  });

  afterEach(async () => {
    // Clean up tracking table between tests
    try {
      await sql`DROP TABLE IF EXISTS ${sql.ref(SCHEMA_VERSIONS_TABLE)}`.execute(db.db);
    } catch { /* ignore */ }
    await db.destroy();
  });

  it('bootstrap() creates the tracking table', async () => {
    await tracker.bootstrap();
    const rows = await (db.db as any)
      .selectFrom(SCHEMA_VERSIONS_TABLE)
      .selectAll()
      .execute();
    expect(rows).toHaveLength(0);
  });

  it('bootstrap() is idempotent — calling twice does not throw', async () => {
    await tracker.bootstrap();
    await expect(tracker.bootstrap()).resolves.not.toThrow();
  });

  it('getApplied() returns empty Set when no records', async () => {
    await tracker.bootstrap();
    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.size).toBe(0);
  });

  it('record() then getApplied() returns the version', async () => {
    await tracker.bootstrap();
    await tracker.record('@ikary/test', '0.1.0');
    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.has('0.1.0')).toBe(true);
  });

  it('getApplied() filters by packageName', async () => {
    await tracker.bootstrap();
    await tracker.record('@ikary/a', '0.1.0');
    await tracker.record('@ikary/b', '1.0.0');
    const appliedA = await tracker.getApplied('@ikary/a');
    expect(appliedA.has('0.1.0')).toBe(true);
    expect(appliedA.has('1.0.0')).toBe(false);
  });

  it('deleteVersion() removes the record', async () => {
    await tracker.bootstrap();
    await tracker.record('@ikary/test', '0.1.0');
    await tracker.deleteVersion('@ikary/test', '0.1.0');
    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.size).toBe(0);
  });

  it('deleteVersion() for non-existent version does not throw', async () => {
    await tracker.bootstrap();
    await expect(tracker.deleteVersion('@ikary/test', '9.9.9')).resolves.not.toThrow();
  });

  it('record() stores multiple versions for the same package', async () => {
    await tracker.bootstrap();
    await tracker.record('@ikary/test', '0.1.0');
    await tracker.record('@ikary/test', '1.0.0');
    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.size).toBe(2);
    expect(applied.has('0.1.0')).toBe(true);
    expect(applied.has('1.0.0')).toBe(true);
  });
});
