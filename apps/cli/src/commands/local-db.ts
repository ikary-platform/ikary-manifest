import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';
import { MigrationRunner } from '@ikary/system-migration-core';
import { IkaryConfigError, loadIkaryConfig } from '../config/load-ikary-config.js';
import * as fmt from '../output/format.js';
import { theme } from '../output/theme.js';

/**
 * Built-in `@ikary/*` packages that ship database migrations, in dependency
 * order.
 *
 * The CLI tries to resolve each package from the current working directory.
 * Packages not installed in the active project are silently skipped — so this
 * command works correctly from both ikary-manifest and ikary-worker (or any
 * other repo that depends on a subset of these packages).
 *
 * The shared `ikary_schema_versions` table makes every run idempotent:
 * if ikary-manifest already applied cell-runtime-core@v0.3.0, running this
 * command from ikary-worker will skip those versions automatically.
 *
 * Downstream projects can extend this list without a PR to this repo:
 *   - `--package <name>` CLI flag (repeatable) on migrate/status/reset
 *   - `ikary.config.json` in the project root, under `migrate.packages`
 *
 * Both extension points are additive — defaults are always included.
 */
export const DEFAULT_MIGRATION_PACKAGES = [
  '@ikary/cell-runtime-core',    // outbox + audit tables
  '@ikary/system-log-core',      // log settings, sinks, and entries tables
  '@ikary/worker-consumer',      // consumer receipts + offsets tables
  '@ikary/worker-audit',         // ikary_audit_entries
  '@ikary/worker-analytics',     // ikary_analytics_buckets_hourly
  '@ikary/worker-activity-feed', // ikary_activity_entries
] as const;

interface MigrationSource {
  packageName: string;
  migrationsRoot: string;
}

/**
 * Merge the built-in defaults with extras from `ikary.config.json` and the
 * CLI's `--package` flag. Preserves the first-occurrence order so migration
 * dependencies (e.g. cell-runtime-core before packages that reference it)
 * stay correct, and deduplicates so a package can't be tried twice.
 */
export function resolveMigrationPackages(cliPackages: readonly string[] = []): string[] {
  const configPackages = loadIkaryConfig().migrate?.packages ?? [];
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const name of [...DEFAULT_MIGRATION_PACKAGES, ...configPackages, ...cliPackages]) {
    if (!seen.has(name)) {
      seen.add(name);
      ordered.push(name);
    }
  }
  return ordered;
}

/**
 * Resolve the migrations directory for a package.
 * Resolution starts from process.cwd() so the CLI works from any project
 * that has the package installed, not just from within ikary-manifest.
 * Returns null when the package is not installed or has no migrations/.
 */
function resolveMigrationSource(packageName: string): MigrationSource | null {
  try {
    const req = createRequire(resolve(process.cwd(), '__cwd_resolver__.js'));
    const pkgJsonPath = req.resolve(`${packageName}/package.json`);
    const migrationsRoot = resolve(pkgJsonPath, '..', 'migrations');
    if (!existsSync(migrationsRoot)) return null;
    return { packageName, migrationsRoot };
  } catch {
    return null; // Package not installed in this project — skip
  }
}

function getDbUrl(override?: string): string {
  return override ?? process.env['DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5432/ikary';
}

interface Runners {
  sources: MigrationSource[];
  runners: MigrationRunner[];
  dbService: DatabaseService;
}

function buildRunners(dbUrl: string, cliPackages: readonly string[] = []): Runners {
  const dbService = new DatabaseService(
    databaseConnectionOptionsSchema.parse({ connectionString: dbUrl }),
  );

  const sources = resolveMigrationPackages(cliPackages)
    .map(resolveMigrationSource)
    .filter((s): s is MigrationSource => s !== null);

  const runners = sources.map(
    (source) =>
      new MigrationRunner(dbService, {
        packageName: source.packageName,
        migrationsRoot: source.migrationsRoot,
      }),
  );

  return { sources, runners, dbService };
}

/**
 * Shared guard so every command handler reports the same friendly error when
 * `ikary.config.json` is malformed.
 */
function reportConfigError(err: unknown): boolean {
  if (err instanceof IkaryConfigError) {
    fmt.error(err.message);
    fmt.newline();
    process.exitCode = 1;
    return true;
  }
  return false;
}

export async function localDbMigrateCommand(options: {
  databaseUrl?: string;
  dryRun?: boolean;
  force?: boolean;
  package?: string[];
}): Promise<void> {
  const dbUrl = getDbUrl(options.databaseUrl);

  fmt.section('Database migrations');
  fmt.muted(`Database: ${dbUrl}`);
  fmt.newline();

  const spinner = fmt.createSpinner('Connecting...');
  spinner.start();

  try {
    const { sources, runners, dbService } = buildRunners(dbUrl, options.package ?? []);

    if (sources.length === 0) {
      spinner.warn(theme.body('No migration packages found in this project.'));
      fmt.newline();
      await dbService.destroy();
      return;
    }

    let totalApplied = 0;

    for (let i = 0; i < runners.length; i++) {
      const source = sources[i]!;
      const runner = runners[i]!;

      spinner.text = options.dryRun
        ? `Checking ${source.packageName}…`
        : `Applying ${source.packageName}…`;

      const result = await runner.migrate({ dryRun: options.dryRun, force: options.force });
      totalApplied += result.applied;

      if (result.applied > 0) {
        const label = options.dryRun ? 'pending' : 'applied';
        spinner.info(theme.body(`${source.packageName}  ${result.applied} migration(s) ${label}`));
      }
    }

    if (totalApplied === 0) {
      spinner.succeed(theme.success('Database is up to date'));
    } else if (options.dryRun) {
      spinner.succeed(theme.success(`${totalApplied} migration(s) pending across ${sources.length} package(s)`));
    } else {
      spinner.succeed(theme.success(`Applied ${totalApplied} migration(s) across ${sources.length} package(s)`));
    }

    await dbService.destroy();
    fmt.newline();
  } catch (err) {
    spinner.fail(theme.error('Migration failed'));
    fmt.newline();
    if (!reportConfigError(err)) {
      fmt.error(err instanceof Error ? err.message : String(err));
      fmt.newline();
    }
    process.exitCode = 1;
  }
}

export async function localDbStatusCommand(options: {
  databaseUrl?: string;
  package?: string[];
}): Promise<void> {
  const dbUrl = getDbUrl(options.databaseUrl);

  fmt.section('Migration status');
  fmt.muted(`Database: ${dbUrl}`);
  fmt.newline();

  try {
    const { sources, runners, dbService } = buildRunners(dbUrl, options.package ?? []);

    if (sources.length === 0) {
      fmt.muted('No migration packages found in this project.');
      fmt.newline();
      await dbService.destroy();
      return;
    }

    for (let i = 0; i < runners.length; i++) {
      const source = sources[i]!;
      const runner = runners[i]!;

      fmt.body(`${source.packageName}`);
      const status = await runner.status();

      if (status.applied.length === 0 && status.pending.length === 0) {
        fmt.muted('  — no migrations found —');
      } else {
        for (const v of status.applied) {
          fmt.body(`  ${theme.success('✓')} ${v}`);
        }
        for (const v of status.pending) {
          fmt.body(`  ${theme.muted('○')} ${v}`);
        }
      }
      fmt.newline();
    }

    await dbService.destroy();
  } catch (err) {
    if (!reportConfigError(err)) {
      fmt.error(err instanceof Error ? err.message : String(err));
      fmt.newline();
      process.exitCode = 1;
    }
  }
}

export async function localDbResetCommand(options: {
  databaseUrl?: string;
  yes?: boolean;
  package?: string[];
}): Promise<void> {
  if (!options.yes) {
    fmt.error('--yes flag is required to confirm the reset.');
    fmt.muted('This clears all migration tracking so migrations will re-run on the next migrate.');
    fmt.newline();
    process.exitCode = 1;
    return;
  }

  const dbUrl = getDbUrl(options.databaseUrl);

  fmt.section('Resetting migration state');
  fmt.muted(`Database: ${dbUrl}`);
  fmt.newline();

  const spinner = fmt.createSpinner('Clearing tracking records...');
  spinner.start();

  try {
    const { sources, runners, dbService } = buildRunners(dbUrl, options.package ?? []);

    for (let i = 0; i < runners.length; i++) {
      const source = sources[i]!;
      await runners[i]!.reset();
      spinner.info(theme.body(`${source.packageName}  tracking cleared`));
    }

    spinner.succeed(theme.success('Migration state cleared'));
    fmt.newline();
    fmt.muted("Run 'ikary local db migrate' to re-apply migrations.");
    fmt.newline();
    await dbService.destroy();
  } catch (err) {
    spinner.fail(theme.error('Reset failed'));
    fmt.newline();
    if (!reportConfigError(err)) {
      fmt.error(err instanceof Error ? err.message : String(err));
      fmt.newline();
    }
    process.exitCode = 1;
  }
}
