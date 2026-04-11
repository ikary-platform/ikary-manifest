import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { RegistryService } from './registry.service';

const FEATURE_RECORD = { id: 'f1', code: 'MY_FEATURE', description: null, created_at: new Date() };
const DOMAIN_RECORD = { id: 'd1', code: 'MY_DOMAIN', description: null, created_at: new Date() };

function makeService(
  overrides: {
    config?: Record<string, any>;
    db?: Record<string, any>;
    repository?: Record<string, any>;
    codeNormalizer?: Record<string, any>;
  } = {},
) {
  const config = {
    isFeatureModeEnabled: vi.fn().mockReturnValue(true),
    isDomainModeEnabled: vi.fn().mockReturnValue(true),
    ...overrides.config,
  };

  const db = {
    withTransaction: vi.fn(async (cb: (client: any) => Promise<void>) => {
      await cb('tx-client');
    }),
    ...overrides.db,
  };

  const repository = {
    upsertFeature: vi.fn().mockResolvedValue(FEATURE_RECORD),
    upsertDomain: vi.fn().mockResolvedValue(DOMAIN_RECORD),
    featureExists: vi.fn().mockResolvedValue(true),
    domainExists: vi.fn().mockResolvedValue(true),
    listFeatures: vi.fn().mockResolvedValue([FEATURE_RECORD]),
    listDomains: vi.fn().mockResolvedValue([DOMAIN_RECORD]),
    ...overrides.repository,
  };

  const codeNormalizer = {
    normalizeScopeCode: vi.fn((c: string) => c.toUpperCase()),
    ...overrides.codeNormalizer,
  };

  return {
    service: new (RegistryService as any)(config, db, repository, codeNormalizer) as RegistryService,
    mocks: { config, db, repository, codeNormalizer },
  };
}

describe('RegistryService.registerFeature', () => {
  it('throws ForbiddenException when feature mode is disabled', async () => {
    const { service } = makeService({ config: { isFeatureModeEnabled: vi.fn().mockReturnValue(false) } });
    await expect(service.registerFeature('X')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('normalizes code and delegates to repository.upsertFeature', async () => {
    const { service, mocks } = makeService();
    await service.registerFeature('my_feature', 'A feature');
    expect(mocks.codeNormalizer.normalizeScopeCode).toHaveBeenCalledWith('my_feature');
    expect(mocks.repository.upsertFeature).toHaveBeenCalledWith({ code: 'MY_FEATURE', description: 'A feature' });
  });

  it('passes undefined description when not provided', async () => {
    const { service, mocks } = makeService();
    await service.registerFeature('my_feature');
    expect(mocks.repository.upsertFeature).toHaveBeenCalledWith({ code: 'MY_FEATURE', description: undefined });
  });
});

describe('RegistryService.registerDomain', () => {
  it('throws ForbiddenException when domain mode is disabled', async () => {
    const { service } = makeService({ config: { isDomainModeEnabled: vi.fn().mockReturnValue(false) } });
    await expect(service.registerDomain('X')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('normalizes code and delegates to repository.upsertDomain', async () => {
    const { service, mocks } = makeService();
    await service.registerDomain('my_domain', 'A domain');
    expect(mocks.codeNormalizer.normalizeScopeCode).toHaveBeenCalledWith('my_domain');
    expect(mocks.repository.upsertDomain).toHaveBeenCalledWith({ code: 'MY_DOMAIN', description: 'A domain' });
  });

  it('passes undefined description when not provided', async () => {
    const { service, mocks } = makeService();
    await service.registerDomain('my_domain');
    expect(mocks.repository.upsertDomain).toHaveBeenCalledWith({ code: 'MY_DOMAIN', description: undefined });
  });
});

describe('RegistryService.setupAuthorization', () => {
  it('uses a transaction to register features and domains', async () => {
    const { service, mocks } = makeService();
    await service.setupAuthorization({ features: ['feat_a', 'feat_b'], domains: ['dom_a'] });

    expect(mocks.db.withTransaction).toHaveBeenCalled();
    expect(mocks.repository.upsertFeature).toHaveBeenCalledTimes(2);
    expect(mocks.repository.upsertFeature).toHaveBeenCalledWith({ code: 'FEAT_A' }, 'tx-client');
    expect(mocks.repository.upsertFeature).toHaveBeenCalledWith({ code: 'FEAT_B' }, 'tx-client');
    expect(mocks.repository.upsertDomain).toHaveBeenCalledWith({ code: 'DOM_A' }, 'tx-client');
  });

  it('skips features when feature mode is disabled', async () => {
    const { service, mocks } = makeService({
      config: {
        isFeatureModeEnabled: vi.fn().mockReturnValue(false),
        isDomainModeEnabled: vi.fn().mockReturnValue(true),
      },
    });
    await service.setupAuthorization({ features: ['feat_a'], domains: ['dom_a'] });

    expect(mocks.repository.upsertFeature).not.toHaveBeenCalled();
    expect(mocks.repository.upsertDomain).toHaveBeenCalledWith({ code: 'DOM_A' }, 'tx-client');
  });

  it('skips domains when domain mode is disabled', async () => {
    const { service, mocks } = makeService({
      config: {
        isFeatureModeEnabled: vi.fn().mockReturnValue(true),
        isDomainModeEnabled: vi.fn().mockReturnValue(false),
      },
    });
    await service.setupAuthorization({ features: ['feat_a'], domains: ['dom_a'] });

    expect(mocks.repository.upsertFeature).toHaveBeenCalledWith({ code: 'FEAT_A' }, 'tx-client');
    expect(mocks.repository.upsertDomain).not.toHaveBeenCalled();
  });

  it('defaults to empty arrays when features and domains are not provided', async () => {
    const { service, mocks } = makeService();
    await service.setupAuthorization({});

    expect(mocks.db.withTransaction).toHaveBeenCalled();
    expect(mocks.repository.upsertFeature).not.toHaveBeenCalled();
    expect(mocks.repository.upsertDomain).not.toHaveBeenCalled();
  });
});

describe('RegistryService.listFeatures', () => {
  it('delegates to repository.listFeatures', async () => {
    const { service, mocks } = makeService();
    const result = await service.listFeatures();
    expect(mocks.repository.listFeatures).toHaveBeenCalled();
    expect(result).toEqual([FEATURE_RECORD]);
  });
});

describe('RegistryService.listDomains', () => {
  it('delegates to repository.listDomains', async () => {
    const { service, mocks } = makeService();
    const result = await service.listDomains();
    expect(mocks.repository.listDomains).toHaveBeenCalled();
    expect(result).toEqual([DOMAIN_RECORD]);
  });
});

describe('RegistryService.ensureScopeExists', () => {
  it('delegates to repository.featureExists when scopeType is FEATURE', async () => {
    const { service, mocks } = makeService();
    const result = await service.ensureScopeExists('FEATURE', 'MY_FEATURE');
    expect(mocks.repository.featureExists).toHaveBeenCalledWith('MY_FEATURE');
    expect(result).toBe(true);
  });

  it('delegates to repository.domainExists when scopeType is DOMAIN', async () => {
    const { service, mocks } = makeService();
    const result = await service.ensureScopeExists('DOMAIN', 'MY_DOMAIN');
    expect(mocks.repository.domainExists).toHaveBeenCalledWith('MY_DOMAIN');
    expect(result).toBe(true);
  });

  it('returns false when feature does not exist', async () => {
    const { service } = makeService({ repository: { featureExists: vi.fn().mockResolvedValue(false) } });
    const result = await service.ensureScopeExists('FEATURE', 'UNKNOWN');
    expect(result).toBe(false);
  });

  it('returns false when domain does not exist', async () => {
    const { service } = makeService({ repository: { domainExists: vi.fn().mockResolvedValue(false) } });
    const result = await service.ensureScopeExists('DOMAIN', 'UNKNOWN');
    expect(result).toBe(false);
  });
});
