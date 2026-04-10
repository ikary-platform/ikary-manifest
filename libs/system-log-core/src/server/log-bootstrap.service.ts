import { Inject, Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { LogSinksService } from './services/log-sinks.service';
import { SYSTEM_LOG_MODULE_OPTIONS, SERVICE_TENANT_ID } from './log.tokens';
import type { SystemLogModuleOptions } from './log.options.schema';

@Injectable()
export class LogBootstrapService implements OnApplicationBootstrap {
  constructor(
    private readonly sinksService: LogSinksService,
    @Inject(SYSTEM_LOG_MODULE_OPTIONS) private readonly options: SystemLogModuleOptions,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.options.seedDefaultSink) return;

    try {
      const sinks = await this.sinksService.getEnabledSinks(SERVICE_TENANT_ID);
      if (sinks.length === 0) {
        await this.sinksService.createSink({
          tenantId: SERVICE_TENANT_ID,
          scope: 'tenant',
          sinkType: 'persistent',
          retentionHours: 72,
          config: {},
        });
      }
    } catch {
      // Bootstrap errors must not prevent application startup
    }
  }
}
