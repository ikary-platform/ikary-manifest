import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Global, Module } from '@nestjs/common';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';
import { MigrationRunner } from '@ikary/system-migration-core';

const _require = createRequire(import.meta.url ?? `file://${process.cwd()}/`);

function resolveSystemLogMigrationsRoot(): string {
  const here = new URL('.', import.meta.url ?? `file://${process.cwd()}/`).pathname;
  const relPath = resolve(here, '..', '..', '..', 'libs', 'system-log-core', 'migrations');
  if (existsSync(relPath)) return relPath;

  try {
    const pkgJson = _require.resolve('@ikary/system-log-core/package.json');
    return resolve(pkgJson, '..', 'migrations');
  } catch {
    throw new Error(`Cannot locate system-log-core migrations. Looked at: ${relPath}`);
  }
}

@Global()
@Module({
  providers: [
    {
      provide: DatabaseService,
      useFactory: async (): Promise<DatabaseService> => {
        const rawDbUrl = process.env['DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5432/ikary';
        const dbOptions = databaseConnectionOptionsSchema.parse({ connectionString: rawDbUrl });
        const dbService = new DatabaseService(dbOptions);

        try {
          const migrations = new MigrationRunner(dbService, {
            packageName: '@ikary/system-log-core',
            migrationsRoot: resolveSystemLogMigrationsRoot(),
          });
          await migrations.migrate();
        } catch (err) {
          console.warn('[DatabaseModule] DB unavailable — structured logging disabled:', (err as Error).message);
        }

        return dbService;
      },
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
