import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';
import { MigrationTracker, SCHEMA_VERSIONS_TABLE } from '../tracker/migration-tracker.js';
import { MigrationExecutor } from './migration-executor.js';
import type { MigrationVersion } from '../shared/migration-version.schema.js';

function createDb(): DatabaseService {
  return new DatabaseService(
    databaseConnectionOptionsSchema.parse({ connectionString: 'sqlite://:memory:' }),
  );
}

function makeTmpDir(): string {
  const dir = join(tmpdir(), `executor-test-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe('MigrationExecutor', () => {
  let db: DatabaseService;
  let tracker: MigrationTracker;
  let executor: MigrationExecutor;
  let tmpDir: string;

  beforeEach(async () => {
    db = createDb();
    tracker = new MigrationTracker(db);
    await tracker.bootstrap();
    executor = new MigrationExecutor(db);
    tmpDir = makeTmpDir();
  });

  afterEach(async () => {
    await db.destroy();
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function makeVersion(version: string, sqlFiles: { name: string; content: string }[]): MigrationVersion {
    const files = sqlFiles.map(({ name, content }) => {
      const absolutePath = join(tmpDir, name);
      writeFileSync(absolutePath, content);
      return { fileName: name, absolutePath };
    });
    return { packageName: '@ikary/test', version, versionDir: `v${version}`, files };
  }

  it('applies SQL from file and creates the table', async () => {
    const version = makeVersion('0.1.0', [
      { name: '001-create.sql', content: 'CREATE TABLE test_exec (id INTEGER PRIMARY KEY);' },
    ]);
    await executor.execute([version]);

    const rows = await (db.db as any).selectFrom('test_exec').selectAll().execute();
    expect(rows).toHaveLength(0); // table exists, empty
  });

  it('records version in ikary_schema_versions after apply', async () => {
    const version = makeVersion('0.1.0', [
      { name: '001.sql', content: 'CREATE TABLE test_record (id INTEGER PRIMARY KEY);' },
    ]);
    await executor.execute([version]);

    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.has('0.1.0')).toBe(true);
  });

  it('dryRun=true increments count but does not apply SQL', async () => {
    const version = makeVersion('0.1.0', [
      { name: '001.sql', content: 'CREATE TABLE test_dry (id INTEGER PRIMARY KEY);' },
    ]);
    const result = await executor.execute([version], true);
    expect(result.applied).toBe(1);

    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.size).toBe(0);
  });

  it('applies multiple SQL files in order within one version', async () => {
    const version = makeVersion('0.1.0', [
      { name: '001-a.sql', content: 'CREATE TABLE multi_a (id INTEGER PRIMARY KEY);' },
      { name: '002-b.sql', content: 'CREATE TABLE multi_b (id INTEGER PRIMARY KEY);' },
    ]);
    await executor.execute([version]);

    const rowsA = await (db.db as any).selectFrom('multi_a').selectAll().execute();
    const rowsB = await (db.db as any).selectFrom('multi_b').selectAll().execute();
    expect(rowsA).toBeDefined();
    expect(rowsB).toBeDefined();
  });

  it('applies multiple versions in sequence', async () => {
    const v1 = makeVersion('0.1.0', [
      { name: '001-v1.sql', content: 'CREATE TABLE seq_v1 (id INTEGER PRIMARY KEY);' },
    ]);
    const v2 = makeVersion('1.0.0', [
      { name: '001-v2.sql', content: 'CREATE TABLE seq_v2 (id INTEGER PRIMARY KEY);' },
    ]);
    const result = await executor.execute([v1, v2]);
    expect(result.applied).toBe(2);

    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.has('0.1.0')).toBe(true);
    expect(applied.has('1.0.0')).toBe(true);
  });

  it('rolls back transaction on SQL error — table not created and version not recorded', async () => {
    const version = makeVersion('0.1.0', [
      { name: '001-bad.sql', content: 'THIS IS NOT VALID SQL !!!;' },
    ]);
    await expect(executor.execute([version])).rejects.toThrow();

    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.size).toBe(0);
  });

  it('returns correct applied count', async () => {
    const versions = [
      makeVersion('0.1.0', [{ name: '001-cnt-a.sql', content: 'CREATE TABLE cnt_a (id INTEGER PRIMARY KEY);' }]),
      makeVersion('1.0.0', [{ name: '001-cnt-b.sql', content: 'CREATE TABLE cnt_b (id INTEGER PRIMARY KEY);' }]),
    ];
    const result = await executor.execute(versions);
    expect(result.applied).toBe(2);
  });

  it('returns 0 applied when versions array is empty', async () => {
    const result = await executor.execute([]);
    expect(result.applied).toBe(0);
  });

  it('verifies SCHEMA_VERSIONS_TABLE constant', () => {
    expect(SCHEMA_VERSIONS_TABLE).toBe('ikary_schema_versions');
  });
});
