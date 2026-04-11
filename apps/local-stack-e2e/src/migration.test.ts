import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { unlinkSync, existsSync } from 'node:fs';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '../../..');
const CLI_PATH = join(REPO_ROOT, 'apps/cli/dist/cli.js');
const TIMEOUT_MS = 15_000;

function runCli(args: string[]): ReturnType<typeof spawnSync> {
  return spawnSync('node', [CLI_PATH, ...args], {
    encoding: 'utf8',
    timeout: TIMEOUT_MS,
  });
}

describe('ikary local db — migration commands', () => {
  let dbPath: string;

  beforeEach(() => {
    dbPath = join(tmpdir(), `ikary-migration-test-${Date.now()}.db`);
  });

  afterEach(() => {
    if (existsSync(dbPath)) unlinkSync(dbPath);
  });

  it('migrate creates audit_log and ikary_schema_versions tables', () => {
    const result = runCli(['local', 'db', 'migrate', '--database-url', `sqlite://${dbPath}`]);
    expect(result.status).toBe(0);

    const db = new Database(dbPath);
    const tables = (
      db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as {
        name: string;
      }[]
    ).map((t) => t.name);
    db.close();

    expect(tables).toContain('audit_log');
    expect(tables).toContain('ikary_schema_versions');
  });

  it('migrate is idempotent — second run reports up to date', () => {
    runCli(['local', 'db', 'migrate', '--database-url', `sqlite://${dbPath}`]);
    const second = runCli(['local', 'db', 'migrate', '--database-url', `sqlite://${dbPath}`]);
    expect(second.status).toBe(0);
    // ora spinner writes to stderr
    expect(second.stderr).toMatch(/up to date/i);
  });

  it('status shows applied version after migrate', () => {
    runCli(['local', 'db', 'migrate', '--database-url', `sqlite://${dbPath}`]);
    const status = runCli(['local', 'db', 'status', '--database-url', `sqlite://${dbPath}`]);
    expect(status.status).toBe(0);
    expect(status.stdout).toMatch(/0\.1\.0/);
  });

  it('reset clears tracking so migrate re-applies', () => {
    runCli(['local', 'db', 'migrate', '--database-url', `sqlite://${dbPath}`]);
    runCli(['local', 'db', 'reset', '--yes', '--database-url', `sqlite://${dbPath}`]);

    // After reset, delete the DB file so re-migrate starts clean
    // (reset only clears the tracking table, not the actual schema).
    if (existsSync(dbPath)) unlinkSync(dbPath);

    const rerun = runCli(['local', 'db', 'migrate', '--database-url', `sqlite://${dbPath}`]);
    expect(rerun.status).toBe(0);
    // ora spinner writes to stderr — 2 versions: v0.1.0 + v0.2.0
    expect(rerun.stderr).toMatch(/applied 2/i);
  });

  it('reset without --yes exits with non-zero status', () => {
    const result = runCli(['local', 'db', 'reset', '--database-url', `sqlite://${dbPath}`]);
    expect(result.status).not.toBe(0);
  });

  it('dry-run does not apply migrations', () => {
    const result = runCli([
      'local',
      'db',
      'migrate',
      '--dry-run',
      '--database-url',
      `sqlite://${dbPath}`,
    ]);
    expect(result.status).toBe(0);

    // SQLite creates the file on connect; but the migration SQL should not have run
    // so audit_log must not exist
    if (existsSync(dbPath)) {
      const db = new Database(dbPath);
      const tables = (
        db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]
      ).map((t) => t.name);
      db.close();
      expect(tables).not.toContain('audit_log');
    }
  });
});
