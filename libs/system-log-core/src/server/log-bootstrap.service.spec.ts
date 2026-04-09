import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LogBootstrapService } from './log-bootstrap.service.js';
import { SERVICE_TENANT_ID } from './log.tokens.js';

const OPTS_SEED_ON = { service: 'svc', pretty: false, packageVersion: '1.0.0', seedDefaultSink: true };
const OPTS_SEED_OFF = { ...OPTS_SEED_ON, seedDefaultSink: false };

describe('LogBootstrapService', () => {
  let mockSinksService: {
    getEnabledSinks: ReturnType<typeof vi.fn>;
    createSink: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSinksService = {
      getEnabledSinks: vi.fn().mockResolvedValue([]),
      createSink: vi.fn().mockResolvedValue({}),
    };
  });

  it('does nothing when seedDefaultSink=false', async () => {
    const service = new LogBootstrapService(mockSinksService as any, OPTS_SEED_OFF);
    await service.onApplicationBootstrap();
    expect(mockSinksService.getEnabledSinks).not.toHaveBeenCalled();
  });

  it('creates a persistent sink when none exist', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([]);
    const service = new LogBootstrapService(mockSinksService as any, OPTS_SEED_ON);
    await service.onApplicationBootstrap();
    expect(mockSinksService.createSink).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: SERVICE_TENANT_ID,
        scope: 'tenant',
        sinkType: 'persistent',
        retentionHours: 72,
      }),
    );
  });

  it('skips creation when sinks already exist', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([{ id: 'existing-sink' }]);
    const service = new LogBootstrapService(mockSinksService as any, OPTS_SEED_ON);
    await service.onApplicationBootstrap();
    expect(mockSinksService.createSink).not.toHaveBeenCalled();
  });

  it('swallows errors so startup is not blocked', async () => {
    mockSinksService.getEnabledSinks.mockRejectedValue(new Error('DB not ready'));
    const service = new LogBootstrapService(mockSinksService as any, OPTS_SEED_ON);
    await expect(service.onApplicationBootstrap()).resolves.not.toThrow();
  });
});
