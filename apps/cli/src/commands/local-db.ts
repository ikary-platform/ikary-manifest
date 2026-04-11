import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';
import { MigrationRunner } from '@ikary/cell-migration-core';
import * as fmt from '../output/format.js';
import { theme } from '../output/theme.js';

function resolveMigrationsRoot(): string {
  const req = createRequire(import.meta.url);
  const pkgJson = req.resolve('@ikary/cell-runtime-core/package.json');
  return resolve(pkgJson, '..', 'migrations');
}

function getDbUrl(override?: string): string {
  return override ?? process.env['DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5432/ikary';
}

function createRunnerAndDb(dbUrl: string): { runner: MigrationRunner; dbService: DatabaseService } {
  const dbService = new DatabaseService(
    databaseConnectionOptionsSchema.parse({ connectionString: dbUrl }),
  );
  const runner = new MigrationRunner(dbService, {
    packageName: '@ikary/cell-runtime-core',
    migrationsRoot: resolveMigrationsRoot(),
  });
  return { runner, dbService };
}

export async function localDbMigrateCommand(options: {
  databaseUrl?: string;
  dryRun?: boolean;
  force?: boolean;
}): Promise<void> {
  const dbUrl = getDbUrl(options.databaseUrl);

  fmt.section('Database migrations');
  fmt.muted(`Database: ${dbUrl}`);
  fmt.newline();

  const spinner = fmt.createSpinner('Connecting...');
  spinner.start();

  try {
    const { runner, dbService } = createRunnerAndDb(dbUrl);

    spinner.text = options.dryRun ? 'Checking pending migrations...' : 'Applying migrations...';

    const result = await runner.migrate({ dryRun: options.dryRun, force: options.force });

    if (result.applied === 0) {
      spinner.succeed(theme.success('Database is up to date'));
    } else if (options.dryRun) {
      spinner.succeed(theme.success(`${result.applied} migration(s) pending`));
    } else {
      spinner.succeed(theme.success(`Applied ${result.applied} migration(s)`));
    }

    await dbService.destroy();
    fmt.newline();
  } catch (err) {
    spinner.fail(theme.error('Migration failed'));
    fmt.newline();
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}

export async function localDbStatusCommand(options: { databaseUrl?: string }): Promise<void> {
  const dbUrl = getDbUrl(options.databaseUrl);

  fmt.section('Migration status');
  fmt.muted(`Database: ${dbUrl}`);
  fmt.newline();

  try {
    const { runner, dbService } = createRunnerAndDb(dbUrl);
    const status = await runner.status();

    fmt.body(`Applied   (${status.applied.length}):`);
    if (status.applied.length === 0) {
      fmt.muted('  — none —');
    } else {
      for (const v of status.applied) {
        fmt.body(`  ${theme.success('✓')} ${v}`);
      }
    }

    fmt.newline();
    fmt.body(`Pending   (${status.pending.length}):`);
    if (status.pending.length === 0) {
      fmt.muted('  — none —');
    } else {
      for (const v of status.pending) {
        fmt.body(`  ${theme.warning('○')} ${v}`);
      }
    }

    fmt.newline();
    await dbService.destroy();
  } catch (err) {
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}

export async function localDbResetCommand(options: {
  databaseUrl?: string;
  yes?: boolean;
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
    const { runner, dbService } = createRunnerAndDb(dbUrl);
    await runner.reset();
    spinner.succeed(theme.success('Migration state cleared'));
    fmt.newline();
    fmt.muted("Run 'ikary local db migrate' to re-apply migrations.");
    fmt.newline();
    await dbService.destroy();
  } catch (err) {
    spinner.fail(theme.error('Reset failed'));
    fmt.newline();
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}
