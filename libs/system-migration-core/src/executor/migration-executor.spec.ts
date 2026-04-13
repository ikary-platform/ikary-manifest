import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseService, databaseConnectionOptionsSchema, sql } from '@ikary/system-db-core';
import { MigrationTracker, SCHEMA_VERSIONS_TABLE } from '../tracker/migration-tracker.js';
import { MigrationExecutor, splitStatements } from './migration-executor.js';
import type { MigrationVersion } from '../shared/migration-version.schema.js';

const TEST_DB_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test';

function createDb(): DatabaseService {
  return new DatabaseService(
    databaseConnectionOptionsSchema.parse({ connectionString: TEST_DB_URL }),
  );
}

function makeTmpDir(): string {
  const dir = join(tmpdir(), `executor-test-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

// Track tables created by tests for cleanup
const createdTables: string[] = [];

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
    createdTables.length = 0;
  });

  afterEach(async () => {
    // Clean up tables created by tests
    for (const table of createdTables) {
      try { await sql.raw(`DROP TABLE IF EXISTS ${table}`).execute(db.db); } catch { /* ignore */ }
    }
    try { await sql`DROP TABLE IF EXISTS ${sql.ref(SCHEMA_VERSIONS_TABLE)}`.execute(db.db); } catch { /* ignore */ }
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
    createdTables.push('test_exec');
    const version = makeVersion('0.1.0', [
      { name: '001-create.sql', content: 'CREATE TABLE test_exec (id SERIAL PRIMARY KEY);' },
    ]);
    await executor.execute([version]);

    const rows = await (db.db as any).selectFrom('test_exec').selectAll().execute();
    expect(rows).toHaveLength(0); // table exists, empty
  });

  it('records version in ikary_schema_versions after apply', async () => {
    createdTables.push('test_record');
    const version = makeVersion('0.1.0', [
      { name: '001.sql', content: 'CREATE TABLE test_record (id SERIAL PRIMARY KEY);' },
    ]);
    await executor.execute([version]);

    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.has('0.1.0')).toBe(true);
  });

  it('dryRun=true increments count but does not apply SQL', async () => {
    const version = makeVersion('0.1.0', [
      { name: '001.sql', content: 'CREATE TABLE test_dry (id SERIAL PRIMARY KEY);' },
    ]);
    const result = await executor.execute([version], true);
    expect(result.applied).toBe(1);

    const applied = await tracker.getApplied('@ikary/test');
    expect(applied.size).toBe(0);
  });

  it('applies multiple SQL files in order within one version', async () => {
    createdTables.push('multi_a', 'multi_b');
    const version = makeVersion('0.1.0', [
      { name: '001-a.sql', content: 'CREATE TABLE multi_a (id SERIAL PRIMARY KEY);' },
      { name: '002-b.sql', content: 'CREATE TABLE multi_b (id SERIAL PRIMARY KEY);' },
    ]);
    await executor.execute([version]);

    const rowsA = await (db.db as any).selectFrom('multi_a').selectAll().execute();
    const rowsB = await (db.db as any).selectFrom('multi_b').selectAll().execute();
    expect(rowsA).toBeDefined();
    expect(rowsB).toBeDefined();
  });

  it('applies multiple versions in sequence', async () => {
    createdTables.push('seq_v1', 'seq_v2');
    const v1 = makeVersion('0.1.0', [
      { name: '001-v1.sql', content: 'CREATE TABLE seq_v1 (id SERIAL PRIMARY KEY);' },
    ]);
    const v2 = makeVersion('1.0.0', [
      { name: '001-v2.sql', content: 'CREATE TABLE seq_v2 (id SERIAL PRIMARY KEY);' },
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
    createdTables.push('cnt_a', 'cnt_b');
    const versions = [
      makeVersion('0.1.0', [{ name: '001-cnt-a.sql', content: 'CREATE TABLE cnt_a (id SERIAL PRIMARY KEY);' }]),
      makeVersion('1.0.0', [{ name: '001-cnt-b.sql', content: 'CREATE TABLE cnt_b (id SERIAL PRIMARY KEY);' }]),
    ];
    const result = await executor.execute(versions);
    expect(result.applied).toBe(2);
  });

  it('returns 0 applied when versions array is empty', async () => {
    const result = await executor.execute([]);
    expect(result.applied).toBe(0);
  });

  it('applies multi-statement SQL files (multiple DDL statements per file)', async () => {
    createdTables.push('multi_stmt');
    const version = makeVersion('0.1.0', [
      {
        name: '001-multi.sql',
        content: [
          'CREATE TABLE multi_stmt (id SERIAL PRIMARY KEY);',
          'CREATE INDEX IF NOT EXISTS idx_multi_stmt ON multi_stmt (id);',
        ].join('\n'),
      },
    ]);
    await executor.execute([version]);

    const rows = await (db.db as any).selectFrom('multi_stmt').selectAll().execute();
    expect(rows).toHaveLength(0);
  });

  it('verifies SCHEMA_VERSIONS_TABLE constant', () => {
    expect(SCHEMA_VERSIONS_TABLE).toBe('ikary_schema_versions');
  });
});

describe('splitStatements', () => {
  it('splits simple statements by semicolons', () => {
    expect(splitStatements('SELECT 1; SELECT 2;')).toEqual(['SELECT 1', 'SELECT 2']);
  });

  it('ignores empty segments', () => {
    expect(splitStatements('SELECT 1;; ;')).toEqual(['SELECT 1']);
  });

  it('handles trailing content without semicolon', () => {
    expect(splitStatements('SELECT 1')).toEqual(['SELECT 1']);
  });

  it('preserves dollar-quoted blocks containing semicolons', () => {
    const input = "CREATE FUNCTION f() RETURNS void AS $$ BEGIN RAISE NOTICE 'a;b'; END; $$ LANGUAGE plpgsql; SELECT 1;";
    const result = splitStatements(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('$$');
    expect(result[1]).toBe('SELECT 1');
  });

  it('preserves tagged dollar-quoted blocks', () => {
    const input = "CREATE FUNCTION f() RETURNS void AS $fn$ BEGIN NULL; END; $fn$ LANGUAGE plpgsql; SELECT 2;";
    const result = splitStatements(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('$fn$');
  });

  it('handles dollar sign that is not a quote tag', () => {
    const input = "SELECT $1; SELECT 2;";
    const result = splitStatements(input);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(splitStatements('')).toEqual([]);
    expect(splitStatements('   ')).toEqual([]);
  });
});
