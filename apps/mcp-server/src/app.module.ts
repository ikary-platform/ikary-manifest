import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { Module } from '@nestjs/common';
import { ServicesModule } from './services/services.module';
import { McpModule } from './mcp/mcp.module';
import { ApiModule } from './api/api.module';
import { HealthController } from './health.controller';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';
import { MigrationRunner } from '@ikary/cell-migration-core';
import { SystemLogModule } from '@ikary/system-log-core/server';

const _require = createRequire(import.meta.url ?? `file://${process.cwd()}/`);

function resolveSystemLogMigrationsRoot(): string {
  // Dev: relative path from compiled output
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

@Module({
  imports: [
    ServicesModule,
    McpModule,
    ApiModule,
    SystemLogModule.register({
      databaseProviderToken: DatabaseService,
      service: 'mcp-server',
      pretty: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: DatabaseService,
      useFactory: async (): Promise<DatabaseService> => {
        const rawDbUrl = process.env['DATABASE_URL'] ?? `sqlite://${process.cwd()}/mcp-server.db`;
        const dbOptions = databaseConnectionOptionsSchema.parse({ connectionString: rawDbUrl });
        const dbService = new DatabaseService(dbOptions);

        const migrations = new MigrationRunner(dbService, {
          packageName: '@ikary/system-log-core',
          migrationsRoot: resolveSystemLogMigrationsRoot(),
        });
        await migrations.migrate();

        return dbService;
      },
    },
  ],
})
export class AppModule {}
