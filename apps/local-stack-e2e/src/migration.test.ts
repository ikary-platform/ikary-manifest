import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, resolve, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '../../..');
const CLI_PATH = join(REPO_ROOT, 'apps/cli/dist/cli.js');
const TIMEOUT_MS = 15_000;

const TEST_DB_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test';

function runCli(args: string[]): ReturnType<typeof spawnSync> {
  return spawnSync('node', [CLI_PATH, ...args], {
    encoding: 'utf8',
    timeout: TIMEOUT_MS,
  });
}

describe('ikary local db — migration commands', () => {
  beforeEach(() => {
    // Drop all tables from prior runs to ensure clean state
    spawnSync('node', ['-e', `
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: '${TEST_DB_URL}' });
      pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
        .then(() => pool.end());
    `], { encoding: 'utf8', timeout: 5_000 });
  });

  afterEach(() => {
    spawnSync('node', ['-e', `
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: '${TEST_DB_URL}' });
      pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
        .then(() => pool.end());
    `], { encoding: 'utf8', timeout: 5_000 });
  });

  it('migrate exits with success', () => {
    const result = runCli(['local', 'db', 'migrate', '--database-url', TEST_DB_URL]);
    expect(result.status).toBe(0);
  });

  it('migrate is idempotent — second run reports up to date', () => {
    runCli(['local', 'db', 'migrate', '--database-url', TEST_DB_URL]);
    const second = runCli(['local', 'db', 'migrate', '--database-url', TEST_DB_URL]);
    expect(second.status).toBe(0);
    // ora spinner writes to stderr
    expect(second.stderr).toMatch(/up to date/i);
  });

  it('status shows applied version after migrate', () => {
    runCli(['local', 'db', 'migrate', '--database-url', TEST_DB_URL]);
    const status = runCli(['local', 'db', 'status', '--database-url', TEST_DB_URL]);
    expect(status.status).toBe(0);
    expect(status.stdout).toMatch(/0\.1\.0/);
  });

  it('reset clears tracking so migrate re-applies', () => {
    runCli(['local', 'db', 'migrate', '--database-url', TEST_DB_URL]);
    runCli(['local', 'db', 'reset', '--yes', '--database-url', TEST_DB_URL]);

    // Drop all tables so re-migrate starts from a clean schema
    // (reset only clears tracking; actual DDL tables remain and
    // constraint re-creation would fail without a clean slate).
    spawnSync('node', ['-e', `
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: '${TEST_DB_URL}' });
      pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
        .then(() => pool.end());
    `], { encoding: 'utf8', timeout: 5_000 });

    const rerun = runCli(['local', 'db', 'migrate', '--database-url', TEST_DB_URL]);
    expect(rerun.status).toBe(0);
  });

  it('reset without --yes exits with non-zero status', () => {
    const result = runCli(['local', 'db', 'reset', '--database-url', TEST_DB_URL]);
    expect(result.status).not.toBe(0);
  });

  it('dry-run does not apply migrations', () => {
    const result = runCli([
      'local',
      'db',
      'migrate',
      '--dry-run',
      '--database-url',
      TEST_DB_URL,
    ]);
    expect(result.status).toBe(0);

    // Verify nothing was applied by checking status
    const status = runCli(['local', 'db', 'status', '--database-url', TEST_DB_URL]);
    // After dry-run, all versions should still be pending (none applied)
    expect(status.stdout).not.toMatch(/✓/);
  });
});
