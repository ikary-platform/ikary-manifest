import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';
import { MigrationRunner } from './migration-runner.js';
import { MigrationTracker } from '../tracker/migration-tracker.js';

function createDb(): DatabaseService {
  return new DatabaseService(
    databaseConnectionOptionsSchema.parse({ connectionString: 'sqlite://:memory:' }),
  );
}

function makeTmpDir(): string {
  const dir = join(tmpdir(), `runner-test-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function seedMigrationsDir(root: string): void {
  const v = join(root, 'v0.1.0');
  mkdirSync(v);
  writeFileSync(
    join(v, '001-create-test-table.sql'),
    'CREATE TABLE IF NOT EXISTS runner_test (id INTEGER PRIMARY KEY);',
  );
  const v2 = join(root, 'v1.0.0');
  mkdirSync(v2);
  writeFileSync(
    join(v2, '001-create-second.sql'),
    'CREATE TABLE IF NOT EXISTS runner_second (id INTEGER PRIMARY KEY);',
  );
}

describe('MigrationRunner', () => {
  let db: DatabaseService;
  let migrationsRoot: string;
  let runner: MigrationRunner;

  beforeEach(() => {
    db = createDb();
    migrationsRoot = makeTmpDir();
    seedMigrationsDir(migrationsRoot);
    runner = new MigrationRunner(db, {
      packageName: '@ikary/test',
      migrationsRoot,
    });
  });

  afterEach(async () => {
    await db.destroy();
    rmSync(migrationsRoot, { recursive: true, force: true });
  });

  it('migrate() applies all pending migrations and returns correct counts', async () => {
    const result = await runner.migrate();
    expect(result.applied).toBe(2);
    expect(result.total).toBe(2);
  });

  it('calls logger when migrations are applied', async () => {
    const logger = vi.fn();
    const loggedRunner = new MigrationRunner(db, { packageName: '@ikary/test', migrationsRoot }, logger);
    await loggedRunner.migrate();
    expect(logger).toHaveBeenCalledWith('info', expect.stringContaining('Applied'), expect.objectContaining({ operation: 'migration.complete' }));
  });

  it('second migrate() applies 0 (already applied)', async () => {
    await runner.migrate();
    const second = await runner.migrate();
    expect(second.applied).toBe(0);
    expect(second.total).toBe(0);
  });

  it('migrate({ force: true }) re-applies all versions', async () => {
    await runner.migrate();
    const forced = await runner.migrate({ force: true });
    expect(forced.applied).toBe(2);
    expect(forced.total).toBe(2);
  });

  it('migrate({ dryRun: true }) returns count but does not create tables', async () => {
    const result = await runner.migrate({ dryRun: true });
    expect(result.applied).toBe(2);

    const tracker = new MigrationTracker(db);
    await tracker.bootstrap();
    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.size).toBe(0);
  });

  it('status() before migrate shows pending versions', async () => {
    const status = await runner.status();
    expect(status.applied).toHaveLength(0);
    expect(status.pending).toEqual(['0.1.0', '1.0.0']);
  });

  it('status() after migrate shows applied versions', async () => {
    await runner.migrate();
    const status = await runner.status();
    expect(status.applied).toEqual(['0.1.0', '1.0.0']);
    expect(status.pending).toHaveLength(0);
  });

  it('status() after partial apply shows correct split', async () => {
    const partialRunner = new MigrationRunner(db, {
      packageName: '@ikary/test',
      migrationsRoot,
    });
    // Manually record only first version
    const tracker = new MigrationTracker(db);
    await tracker.bootstrap();
    await tracker.record('@ikary/test', '0.1.0');

    const status = await partialRunner.status();
    expect(status.applied).toEqual(['0.1.0']);
    expect(status.pending).toEqual(['1.0.0']);
  });

  it('reset() clears applied versions', async () => {
    await runner.migrate();
    await runner.reset();

    const status = await runner.status();
    expect(status.applied).toHaveLength(0);
    expect(status.pending).toEqual(['0.1.0', '1.0.0']);
  });

  it('reset() then migrate() re-applies everything', async () => {
    await runner.migrate();
    await runner.reset();
    const result = await runner.migrate();
    expect(result.applied).toBe(2);
  });

  it('migrate() on empty migrations dir returns 0/0', async () => {
    const emptyRoot = makeTmpDir();
    try {
      const emptyRunner = new MigrationRunner(db, {
        packageName: '@ikary/test',
        migrationsRoot: emptyRoot,
      });
      const result = await emptyRunner.migrate();
      expect(result.applied).toBe(0);
      expect(result.total).toBe(0);
    } finally {
      rmSync(emptyRoot, { recursive: true, force: true });
    }
  });

  it('status() on non-existent migrationsRoot returns empty lists', async () => {
    const missingRunner = new MigrationRunner(db, {
      packageName: '@ikary/test',
      migrationsRoot: '/nonexistent/path',
    });
    const status = await missingRunner.status();
    expect(status.applied).toHaveLength(0);
    expect(status.pending).toHaveLength(0);
  });
});
