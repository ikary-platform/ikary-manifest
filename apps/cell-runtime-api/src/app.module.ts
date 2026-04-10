import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Module } from '@nestjs/common';
import { EntityController } from './entity/entity.controller.js';
import { HealthController } from './health/health.controller.js';
import { RUNTIME_CONTEXT_TOKEN } from './runtime-context.js';
import {
  EntitySchemaManager,
  EntityRepository,
  EntityService,
  AuditService,
} from '@ikary/cell-runtime-core';
import { DatabaseService } from '@ikary/system-db-core';
import { MigrationRunner } from '@ikary/cell-migration-core';
import { loadManifestFromFile } from '@ikary/loader';
import { compileCellApp, isValidationResult } from '@ikary/engine';
import { SystemLogModule, LogService } from '@ikary/system-log-core/server';
import { DatabaseModule } from './database.module.js';
import type { RuntimeContext } from './runtime-context.js';

function resolveMigrationsRoot(packageName: string): string {
  const here = fileURLToPath(new URL('.', import.meta.url));
  const libFolder = packageName.replace('@ikary/', '');
  const relPath = resolve(here, '..', '..', '..', 'libs', libFolder, 'migrations');
  if (existsSync(relPath)) return relPath;

  try {
    const req = createRequire(import.meta.url);
    const pkgJson = req.resolve(`${packageName}/package.json`);
    return resolve(pkgJson, '..', 'migrations');
  } catch {
    throw new Error(`Cannot locate ${packageName} migrations. Looked at: ${relPath}`);
  }
}

@Module({
  imports: [
    DatabaseModule,
    SystemLogModule.register({
      databaseProviderToken: DatabaseService,
      service: 'cell-runtime-api',
      pretty: true,
    }),
  ],
  controllers: [HealthController, EntityController],
  providers: [
    {
      provide: RUNTIME_CONTEXT_TOKEN,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: async (dbService: any, logger: LogService): Promise<RuntimeContext> => {
        const manifestPath = process.env['IKARY_MANIFEST_PATH'];
        if (!manifestPath) {
          throw new Error('IKARY_MANIFEST_PATH environment variable is required');
        }

        const loaderResult = await loadManifestFromFile(manifestPath);
        if (!loaderResult.valid || !loaderResult.manifest) {
          const errSummary = loaderResult.errors.map((e) => `${e.field}: ${e.message}`).join('; ');
          throw new Error(`Manifest validation failed: ${errSummary}`);
        }

        const compiled = compileCellApp(loaderResult.manifest);
        if (isValidationResult(compiled)) {
          const errSummary = compiled.errors.map((e: any) => e.message).join('; ');
          throw new Error(`Manifest compilation failed: ${errSummary}`);
        }

        const migrationLog = (level: 'info' | 'warn' | 'error', msg: string, ctx?: Record<string, unknown>) => {
          if (level === 'error') logger.error(msg, ctx as any);
          else if (level === 'warn') logger.warn(msg, ctx as any);
          else logger.log(msg, ctx as any);
        };

        const runtimeMigrations = new MigrationRunner(
          dbService,
          { packageName: '@ikary/cell-runtime-core', migrationsRoot: resolveMigrationsRoot('@ikary/cell-runtime-core') },
          migrationLog,
        );
        await runtimeMigrations.migrate();

        const logMigrations = new MigrationRunner(
          dbService,
          { packageName: '@ikary/system-log-core', migrationsRoot: resolveMigrationsRoot('@ikary/system-log-core') },
          migrationLog,
        );
        await logMigrations.migrate();

        const schemaManager = new EntitySchemaManager(dbService);
        await schemaManager.initFromManifest(compiled as any);

        logger.log('cell-runtime-api started', { operation: 'server.start' });

        return { dbService, manifest: compiled as any };
      },
      inject: [DatabaseService, LogService],
    },
    {
      provide: 'ENTITY_SERVICE',
      useFactory: (ctx: RuntimeContext, logger: LogService): EntityService => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = ctx.dbService as any;
        const repo = new EntityRepository(db);
        const audit = new AuditService(db);
        return new EntityService(repo, audit, logger);
      },
      inject: [RUNTIME_CONTEXT_TOKEN, LogService],
    },
  ],
})
export class AppModule {}
