import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { DatabaseService } from '@ikary/system-db-core';
import { MigrationRunner } from '@ikary/system-migration-core';
import * as fmt from '../output/format.js';

// ── Module mocks ───────────────────────────────────────────────────────────

vi.mock('node:module', () => ({ createRequire: vi.fn() }));
vi.mock('node:fs', () => ({ existsSync: vi.fn() }));

vi.mock('@ikary/system-db-core', () => ({
  DatabaseService: vi.fn(),
  databaseConnectionOptionsSchema: { parse: vi.fn((x) => x) },
}));

vi.mock('@ikary/system-migration-core', () => ({
  MigrationRunner: vi.fn(),
}));

vi.mock('../output/format.js', () => ({
  section: vi.fn(),
  muted: vi.fn(),
  body: vi.fn(),
  newline: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
  createSpinner: vi.fn(),
}));

vi.mock('../output/theme.js', () => ({
  theme: {
    body: (s: string) => s,
    success: (s: string) => s,
    error: (s: string) => s,
    muted: (s: string) => s,
    accent: (s: string) => s,
    section: (s: string) => s,
    bold: (s: string) => s,
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns a mock `req` object whose `resolve()` succeeds for every package
 * in `installed` (returning a fake path) and throws for all others.
 */
function makeReq(installed: string[] = ['@ikary/cell-runtime-core', '@ikary/system-log-core']) {
  return {
    resolve: vi.fn().mockImplementation((id: string) => {
      const pkg = id.replace('/package.json', '');
      if (installed.includes(pkg)) {
        return `/fake/node_modules/${pkg}/package.json`;
      }
      throw new Error(`Cannot find module '${id}'`);
    }),
  };
}

function makeSpinner() {
  return {
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    text: '',
  };
}

// ── Per-test state ─────────────────────────────────────────────────────────

let mockSpinner: ReturnType<typeof makeSpinner>;
let mockRunner: { migrate: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn>; reset: ReturnType<typeof vi.fn> };
let mockDbService: { destroy: ReturnType<typeof vi.fn> };
let originalExitCode: number | undefined;

beforeEach(() => {
  originalExitCode = process.exitCode as number | undefined;
  process.exitCode = undefined;

  mockSpinner = makeSpinner();
  vi.mocked(fmt.createSpinner).mockReturnValue(mockSpinner as any);

  mockDbService = { destroy: vi.fn().mockResolvedValue(undefined) };
  vi.mocked(DatabaseService).mockImplementation(() => mockDbService as any);

  mockRunner = {
    migrate: vi.fn().mockResolvedValue({ applied: 0 }),
    status: vi.fn().mockResolvedValue({ applied: [], pending: [] }),
    reset: vi.fn().mockResolvedValue(undefined),
  };
  vi.mocked(MigrationRunner).mockImplementation(() => mockRunner as any);

  // Default: both packages installed, migrations dir exists
  vi.mocked(createRequire).mockReturnValue(makeReq() as any);
  vi.mocked(existsSync).mockReturnValue(true);
});

afterEach(() => {
  process.exitCode = originalExitCode;
  vi.clearAllMocks();
});

// ── Import after mocks are set up ──────────────────────────────────────────
// Dynamic import ensures vi.mock hoisting is in effect before the module loads.
const { localDbMigrateCommand, localDbStatusCommand, localDbResetCommand } = await import(
  './local-db.js'
);

// ── localDbMigrateCommand ─────────────────────────────────────────────────

describe('localDbMigrateCommand', () => {
  describe('package discovery', () => {
    it('warns and returns early when no packages are installed', async () => {
      vi.mocked(createRequire).mockReturnValue(makeReq([]) as any);

      await localDbMigrateCommand({});

      expect(mockSpinner.warn).toHaveBeenCalledWith(expect.stringContaining('No migration packages'));
      expect(mockRunner.migrate).not.toHaveBeenCalled();
      expect(mockDbService.destroy).toHaveBeenCalled();
    });

    it('skips packages where migrations dir does not exist', async () => {
      // Only cell-runtime-core has a migrations dir
      vi.mocked(existsSync).mockImplementation((p) =>
        String(p).includes('cell-runtime-core'),
      );

      await localDbMigrateCommand({});

      // Only one runner should have been created (cell-runtime-core)
      expect(vi.mocked(MigrationRunner)).toHaveBeenCalledTimes(1);
    });

    it('skips packages that are not installed (createRequire throws)', async () => {
      vi.mocked(createRequire).mockReturnValue(makeReq(['@ikary/cell-runtime-core']) as any);

      await localDbMigrateCommand({});

      expect(vi.mocked(MigrationRunner)).toHaveBeenCalledTimes(1);
    });
  });

  describe('migration results', () => {
    it('reports "up to date" when all packages have 0 applied migrations', async () => {
      mockRunner.migrate.mockResolvedValue({ applied: 0 });

      await localDbMigrateCommand({});

      expect(mockSpinner.succeed).toHaveBeenCalledWith(expect.stringContaining('up to date'));
    });

    it('reports total applied count across all packages', async () => {
      mockRunner.migrate
        .mockResolvedValueOnce({ applied: 2 })
        .mockResolvedValueOnce({ applied: 3 });

      await localDbMigrateCommand({});

      expect(mockSpinner.succeed).toHaveBeenCalledWith(expect.stringContaining('Applied 5'));
      expect(mockSpinner.succeed).toHaveBeenCalledWith(expect.stringContaining('2 package(s)'));
    });

    it('reports per-package info line for each package with applied > 0', async () => {
      mockRunner.migrate.mockResolvedValue({ applied: 1 });

      await localDbMigrateCommand({});

      expect(mockSpinner.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('--dry-run', () => {
    it('reports pending count when dryRun is true', async () => {
      // Both packages return 4 pending → total = 8
      mockRunner.migrate.mockResolvedValue({ applied: 4 });

      await localDbMigrateCommand({ dryRun: true });

      expect(mockSpinner.succeed).toHaveBeenCalledWith(expect.stringContaining('pending'));
      expect(mockSpinner.succeed).toHaveBeenCalledWith(expect.stringContaining('8'));
    });

    it('reports "up to date" on dryRun with 0 pending', async () => {
      mockRunner.migrate.mockResolvedValue({ applied: 0 });

      await localDbMigrateCommand({ dryRun: true });

      expect(mockSpinner.succeed).toHaveBeenCalledWith(expect.stringContaining('up to date'));
    });
  });

  describe('database URL', () => {
    it('uses the provided databaseUrl override', async () => {
      await localDbMigrateCommand({ databaseUrl: 'postgres://custom:pw@host:5432/db' });

      expect(vi.mocked(DatabaseService)).toHaveBeenCalledWith(
        expect.objectContaining({ connectionString: 'postgres://custom:pw@host:5432/db' }),
      );
    });

    it('falls back to DATABASE_URL env variable', async () => {
      const old = process.env['DATABASE_URL'];
      process.env['DATABASE_URL'] = 'postgres://env:pw@envhost/envdb';

      await localDbMigrateCommand({});

      expect(vi.mocked(DatabaseService)).toHaveBeenCalledWith(
        expect.objectContaining({ connectionString: 'postgres://env:pw@envhost/envdb' }),
      );
      process.env['DATABASE_URL'] = old;
    });

    it('falls back to the hardcoded default URL', async () => {
      const old = process.env['DATABASE_URL'];
      delete process.env['DATABASE_URL'];

      await localDbMigrateCommand({});

      expect(vi.mocked(DatabaseService)).toHaveBeenCalledWith(
        expect.objectContaining({ connectionString: 'postgres://ikary:ikary@localhost:5432/ikary' }),
      );
      process.env['DATABASE_URL'] = old;
    });
  });

  describe('error handling', () => {
    it('calls spinner.fail and sets exitCode on migrate error', async () => {
      mockRunner.migrate.mockRejectedValue(new Error('connection refused'));

      await localDbMigrateCommand({});

      expect(mockSpinner.fail).toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    it('destroys dbService even when all packages are skipped', async () => {
      vi.mocked(createRequire).mockReturnValue(makeReq([]) as any);

      await localDbMigrateCommand({});

      expect(mockDbService.destroy).toHaveBeenCalled();
    });
  });
});

// ── localDbStatusCommand ──────────────────────────────────────────────────

describe('localDbStatusCommand', () => {
  it('prints muted message when no packages are installed', async () => {
    vi.mocked(createRequire).mockReturnValue(makeReq([]) as any);

    await localDbStatusCommand({});

    expect(vi.mocked(fmt.muted)).toHaveBeenCalledWith(
      expect.stringContaining('No migration packages'),
    );
    expect(mockDbService.destroy).toHaveBeenCalled();
  });

  it('prints a section per package with applied and pending versions', async () => {
    mockRunner.status.mockResolvedValue({
      applied: ['v0.1.0/001-create-audit-log'],
      pending: ['v0.2.0/001-add-actor'],
    });

    await localDbStatusCommand({});

    // Two packages × two fmt.body calls each (section header + version lines)
    const bodyCalls = vi.mocked(fmt.body).mock.calls.map(([s]) => s);
    expect(bodyCalls.some((s) => s.includes('@ikary/cell-runtime-core'))).toBe(true);
    expect(bodyCalls.some((s) => s.includes('v0.1.0/001-create-audit-log'))).toBe(true);
    expect(bodyCalls.some((s) => s.includes('v0.2.0/001-add-actor'))).toBe(true);
  });

  it('prints "no migrations found" when both lists are empty', async () => {
    mockRunner.status.mockResolvedValue({ applied: [], pending: [] });

    await localDbStatusCommand({});

    expect(vi.mocked(fmt.muted)).toHaveBeenCalledWith(
      expect.stringContaining('no migrations found'),
    );
  });

  it('calls fmt.error and sets exitCode on runner error', async () => {
    mockRunner.status.mockRejectedValue(new Error('db unreachable'));

    await localDbStatusCommand({});

    expect(vi.mocked(fmt.error)).toHaveBeenCalledWith(expect.stringContaining('db unreachable'));
    expect(process.exitCode).toBe(1);
  });
});

// ── localDbResetCommand ───────────────────────────────────────────────────

describe('localDbResetCommand', () => {
  it('exits with error when --yes flag is not provided', async () => {
    await localDbResetCommand({});

    expect(vi.mocked(fmt.error)).toHaveBeenCalledWith(expect.stringContaining('--yes'));
    expect(process.exitCode).toBe(1);
    expect(mockRunner.reset).not.toHaveBeenCalled();
  });

  it('calls runner.reset for each installed package when --yes is given', async () => {
    await localDbResetCommand({ yes: true });

    // Two packages in MIGRATION_PACKAGES, both installed by default
    expect(mockRunner.reset).toHaveBeenCalledTimes(2);
  });

  it('calls spinner.succeed after successful reset', async () => {
    await localDbResetCommand({ yes: true });

    expect(mockSpinner.succeed).toHaveBeenCalledWith(
      expect.stringContaining('Migration state cleared'),
    );
  });

  it('emits a spinner.info per package showing tracking cleared', async () => {
    await localDbResetCommand({ yes: true });

    expect(mockSpinner.info).toHaveBeenCalledTimes(2);
    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('tracking cleared'),
    );
  });

  it('calls spinner.fail and sets exitCode when reset throws', async () => {
    mockRunner.reset.mockRejectedValue(new Error('connection refused'));

    await localDbResetCommand({ yes: true });

    expect(mockSpinner.fail).toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});
