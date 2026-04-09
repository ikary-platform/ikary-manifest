import { createRequire } from 'node:module';
import { resolve } from 'node:path';
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
import {
  DatabaseService,
  databaseConnectionOptionsSchema,
} from '@ikary/system-db-core';
import { MigrationRunner } from '@ikary/cell-migration-core';
import { loadManifestFromFile } from '@ikary/loader';
import { compileCellApp, isValidationResult } from '@ikary/engine';
import type { RuntimeContext } from './runtime-context.js';

function resolveMigrationsRoot(): string {
  const req = createRequire(import.meta.url);
  const pkgJson = req.resolve('@ikary/cell-runtime-core/package.json');
  return resolve(pkgJson, '..', 'migrations');
}

@Module({
  controllers: [HealthController, EntityController],
  providers: [
    {
      provide: RUNTIME_CONTEXT_TOKEN,
      useFactory: async (): Promise<RuntimeContext> => {
        const manifestPath = process.env['IKARY_MANIFEST_PATH'];
        if (!manifestPath) {
          throw new Error('IKARY_MANIFEST_PATH environment variable is required');
        }

        const rawDbUrl = process.env['DATABASE_URL'] ?? `sqlite://${process.cwd()}/local.db`;
        const dbOptions = databaseConnectionOptionsSchema.parse({ connectionString: rawDbUrl });

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

        const dbService = new DatabaseService(dbOptions);

        const migrationRunner = new MigrationRunner(dbService, {
          packageName: '@ikary/cell-runtime-core',
          migrationsRoot: resolveMigrationsRoot(),
        });
        await migrationRunner.migrate();

        const schemaManager = new EntitySchemaManager(dbService);
        await schemaManager.initFromManifest(compiled as any);

        console.log(`[cell-runtime-api] Manifest: ${loaderResult.manifest.metadata.key}`);
        console.log(`[cell-runtime-api] Database: ${rawDbUrl}`);

        return { dbService, manifest: compiled as any };
      },
    },
    {
      provide: 'ENTITY_SERVICE',
      useFactory: (ctx: RuntimeContext): EntityService => {
        const repo = new EntityRepository(ctx.dbService);
        const audit = new AuditService(ctx.dbService);
        return new EntityService(repo, audit);
      },
      inject: [RUNTIME_CONTEXT_TOKEN],
    },
  ],
})
export class AppModule {}
