import { describe, it, expect } from 'vitest';
import { SystemLogModule } from './system-log.module.js';
import { SYSTEM_LOG_MODULE_OPTIONS, SYSTEM_LOG_DATABASE } from './log.tokens.js';
import { LogService } from './log.service.js';
import { LogSettingsService } from './services/log-settings.service.js';
import { LogSinksService } from './services/log-sinks.service.js';
import { LogIngestionService } from './services/log-ingestion.service.js';

describe('SystemLogModule.register()', () => {
  it('returns a DynamicModule with the correct module reference', () => {
    const mod = SystemLogModule.register({ databaseProviderToken: 'MY_DB', service: 'svc' });
    expect(mod.module).toBe(SystemLogModule);
  });

  it('includes all required providers', () => {
    const mod = SystemLogModule.register({ databaseProviderToken: 'MY_DB', service: 'svc' });
    const providerTokens = (mod.providers ?? []).map((p) =>
      typeof p === 'function' ? p : 'provide' in p ? p.provide : p,
    );
    expect(providerTokens).toContain(SYSTEM_LOG_MODULE_OPTIONS);
    expect(providerTokens).toContain(SYSTEM_LOG_DATABASE);
    expect(providerTokens).toContain(LogService);
    expect(providerTokens).toContain(LogSettingsService);
    expect(providerTokens).toContain(LogSinksService);
    expect(providerTokens).toContain(LogIngestionService);
  });

  it('exports LogService, services, and tokens', () => {
    const mod = SystemLogModule.register({ databaseProviderToken: 'MY_DB', service: 'svc' });
    expect(mod.exports).toContain(LogService);
    expect(mod.exports).toContain(SYSTEM_LOG_MODULE_OPTIONS);
    expect(mod.exports).toContain(SYSTEM_LOG_DATABASE);
  });

  it('applies defaults for pretty, packageVersion, seedDefaultSink', () => {
    const mod = SystemLogModule.register({ databaseProviderToken: 'MY_DB', service: 'svc' });
    const optionsProvider = (mod.providers ?? []).find(
      (p) => typeof p === 'object' && 'provide' in p && p.provide === SYSTEM_LOG_MODULE_OPTIONS,
    ) as { useValue: { pretty: boolean; seedDefaultSink: boolean; packageVersion: string } } | undefined;
    expect(optionsProvider?.useValue.pretty).toBe(false);
    expect(optionsProvider?.useValue.seedDefaultSink).toBe(true);
    expect(optionsProvider?.useValue.packageVersion).toBe('1.0.0');
  });

  it('respects explicit pretty=true and seedDefaultSink=false', () => {
    const mod = SystemLogModule.register({
      databaseProviderToken: 'MY_DB',
      service: 'svc',
      pretty: true,
      seedDefaultSink: false,
      packageVersion: '2.0.0',
    });
    const optionsProvider = (mod.providers ?? []).find(
      (p) => typeof p === 'object' && 'provide' in p && p.provide === SYSTEM_LOG_MODULE_OPTIONS,
    ) as { useValue: { pretty: boolean; seedDefaultSink: boolean; packageVersion: string } } | undefined;
    expect(optionsProvider?.useValue.pretty).toBe(true);
    expect(optionsProvider?.useValue.seedDefaultSink).toBe(false);
    expect(optionsProvider?.useValue.packageVersion).toBe('2.0.0');
  });
});
