import { DynamicModule, Global, Module, type Provider } from '@nestjs/common';
import { systemLogModuleOptionsSchema, type SystemLogModuleOptions } from './log.options.schema';
import { SYSTEM_LOG_DATABASE, SYSTEM_LOG_MODULE_OPTIONS } from './log.tokens';
import type { SystemLogProviderToken } from './log.types';
import { LogRepository } from './repositories/log.repository';
import { LogSettingsRepository } from './repositories/log-settings.repository';
import { LogSinksRepository } from './repositories/log-sinks.repository';
import { LogSettingsService } from './services/log-settings.service';
import { LogSinksService } from './services/log-sinks.service';
import { LogIngestionService } from './services/log-ingestion.service';
import { LogCleanupService } from './services/log-cleanup.service';
import { LogService } from './log.service';
import { LogBootstrapService } from './log-bootstrap.service';

export interface RegisterSystemLogModuleOptions {
  databaseProviderToken: SystemLogProviderToken;
  service: string;
  pretty?: boolean;
  packageVersion?: string;
  seedDefaultSink?: boolean;
}

@Global()
@Module({})
export class SystemLogModule {
  static register(input: RegisterSystemLogModuleOptions): DynamicModule {
    const resolved: SystemLogModuleOptions = systemLogModuleOptionsSchema.parse({
      service: input.service,
      pretty: input.pretty ?? false,
      packageVersion: input.packageVersion ?? '1.0.0',
      seedDefaultSink: input.seedDefaultSink ?? true,
    });

    const providers: Provider[] = [
      { provide: SYSTEM_LOG_MODULE_OPTIONS, useValue: resolved },
      { provide: SYSTEM_LOG_DATABASE, useExisting: input.databaseProviderToken },
      LogRepository,
      LogSettingsRepository,
      LogSinksRepository,
      LogSettingsService,
      LogSinksService,
      LogIngestionService,
      LogCleanupService,
      LogBootstrapService,
      LogService,
    ];

    return {
      module: SystemLogModule,
      providers,
      exports: [
        LogService,
        LogSettingsService,
        LogSinksService,
        LogIngestionService,
        LogRepository,
        LogSettingsRepository,
        LogSinksRepository,
        SYSTEM_LOG_MODULE_OPTIONS,
        SYSTEM_LOG_DATABASE,
      ],
    };
  }
}
