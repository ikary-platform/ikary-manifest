import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Module } from '@nestjs/common';
import { EntityController } from './entity/entity.controller.js';
import { HealthController } from './health/health.controller.js';
import { PreviewAuthController } from './preview/preview-auth.controller.js';
import { PreviewBootstrapService } from './preview/preview-bootstrap.service.js';
import { RUNTIME_CONTEXT_TOKEN } from './runtime-context.js';
import {
  EntitySchemaManager,
  EntityRepository,
  EntityService,
  AuditService,
} from '@ikary/cell-runtime-core';
import { DatabaseService } from '@ikary/system-db-core';
import { MigrationRunner } from '@ikary/system-migration-core';
import { loadManifestFromFile } from '@ikary/cell-loader';
import { compileCellApp, isValidationResult } from '@ikary/cell-engine';
import { SystemLogModule, LogService } from '@ikary/system-log-core/server';
import {
  AuthModule,
  AuthAuditService,
  JwtAuthGuard,
} from '@ikary/system-auth';
import { CellBrandingModule } from '@ikary/cell-branding/server';
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

const dbUrl = process.env['DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5432/ikary';

@Module({
  imports: [
    DatabaseModule,
    SystemLogModule.register({
      databaseProviderToken: DatabaseService,
      service: 'cell-runtime-api',
      pretty: true,
    }),
    AuthModule.register({
      database: {
        connectionString: dbUrl,
        ssl: false,
        maxPoolSize: 5,
      },
      jwt: {
        accessTokenSecret: process.env['AUTH_ACCESS_TOKEN_SECRET'] ?? 'ikary-preview-access-secret-key-0',
        refreshTokenSecret: process.env['AUTH_REFRESH_TOKEN_SECRET'] ?? 'ikary-preview-refresh-secret-key0',
        tokenHashSecret: process.env['AUTH_TOKEN_HASH_SECRET'] ?? 'ikary-preview-hash-secret-key-000',
        accessTokenTtlSeconds: 3600,
        refreshTokenTtlSeconds: 86_400 * 14,
        issuer: 'ikary-preview',
        audience: 'ikary-preview',
      },
      cookie: {
        domain: process.env['AUTH_COOKIE_DOMAIN'] ?? 'localhost',
        secure: false,
      },
      classic: {
        enabled: true,
        signup: false,
        resetPassword: false,
        magicLink: false,
        emailVerification: 'code',
        requireEmailVerification: false,
        passwordMinLength: 8,
        verificationCodeLength: 6,
        verificationTokenTtlMinutes: 20,
        resetPasswordTtlMinutes: 30,
        magicLinkTtlMinutes: 15,
      },
      extraExports: [AuthAuditService],
    }),
    CellBrandingModule.register({
      databaseProviderToken: DatabaseService,
      packageVersion: '0.3.0',
      guards: [JwtAuthGuard],
    }),
  ],
  controllers: [HealthController, EntityController, PreviewAuthController],
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

        const authMigrations = new MigrationRunner(
          dbService,
          { packageName: '@ikary/system-auth', migrationsRoot: resolveMigrationsRoot('@ikary/system-auth') },
          migrationLog,
        );
        await authMigrations.migrate();

        const brandingMigrations = new MigrationRunner(
          dbService,
          { packageName: '@ikary/cell-branding', migrationsRoot: resolveMigrationsRoot('@ikary/cell-branding') },
          migrationLog,
        );
        await brandingMigrations.migrate();

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
    PreviewBootstrapService,
  ],
})
export class AppModule {}
