import type { DatabaseService } from '@ikary/system-db-core';
import { MigrationTracker } from '../tracker/migration-tracker.js';
import { MigrationPlanner } from '../planner/migration-planner.js';
import { MigrationExecutor } from '../executor/migration-executor.js';
import type { MigrationRunnerOptions, MigrationStatus } from '../shared/migration-version.schema.js';

export type MigrationLoggerFn = (
  level: 'info' | 'warn' | 'error',
  message: string,
  context?: Record<string, unknown>,
) => void;

export class MigrationRunner {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly options: MigrationRunnerOptions,
    private readonly logger?: MigrationLoggerFn,
  ) {}

  async migrate(opts?: { dryRun?: boolean; force?: boolean }): Promise<{ applied: number; total: number }> {
    const tracker = new MigrationTracker(this.dbService);
    await tracker.bootstrap();

    const applied = await tracker.getApplied(this.options.packageName);
    const planner = new MigrationPlanner(
      this.options.migrationsRoot,
      this.options.packageName,
          );
    const plan = planner.buildPlan(applied, opts?.force ?? false);
    const executor = new MigrationExecutor(this.dbService);
    const result = await executor.execute(plan, opts?.dryRun ?? false);

    if (result.applied > 0) {
      this.logger?.('info', `Applied ${result.applied} migration(s)`, {
        operation: 'migration.complete',
        packageName: this.options.packageName,
        applied: result.applied,
        total: plan.length,
      });
    }

    return { applied: result.applied, total: plan.length };
  }

  async status(): Promise<MigrationStatus> {
    const tracker = new MigrationTracker(this.dbService);
    await tracker.bootstrap();

    const applied = await tracker.getApplied(this.options.packageName);
    const planner = new MigrationPlanner(
      this.options.migrationsRoot,
      this.options.packageName,
          );
    const allPlan = planner.buildPlan(new Set(), false);

    return {
      applied: allPlan.filter((v) => applied.has(v.version)).map((v) => v.version),
      pending: allPlan.filter((v) => !applied.has(v.version)).map((v) => v.version),
    };
  }

  async reset(): Promise<void> {
    const tracker = new MigrationTracker(this.dbService);
    await tracker.bootstrap();

    const applied = await tracker.getApplied(this.options.packageName);
    for (const version of applied) {
      await tracker.deleteVersion(this.options.packageName, version);
    }
  }
}
