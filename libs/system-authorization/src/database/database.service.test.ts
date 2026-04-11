import { describe, expect, it, vi } from 'vitest';

vi.mock('@ikary/system-db-core', () => {
  class MockDatabaseService {
    readonly options: unknown;
    constructor(options: unknown) {
      this.options = options;
    }
    async ping(): Promise<void> {}
  }
  return { DatabaseService: MockDatabaseService };
});

import { DatabaseService } from './database.service';
import type { AuthorizationConfigService } from '../config/authorization-config.service';

function makeFakeConfig(
  overrides: Partial<{ connectionString: string; maxPoolSize: number; ssl: boolean }> = {},
): AuthorizationConfigService {
  return {
    config: {
      database: {
        connectionString: overrides.connectionString ?? 'postgres://localhost/test',
        maxPoolSize: overrides.maxPoolSize ?? 10,
        ssl: overrides.ssl ?? false,
      },
      mode: 'both',
      assignmentLevel: 'user-role-group',
    },
  } as unknown as AuthorizationConfigService;
}

describe('DatabaseService', () => {
  it('passes the correct options to the parent constructor', () => {
    const config = makeFakeConfig({
      connectionString: 'postgres://prod:5432/authz',
      maxPoolSize: 50,
      ssl: true,
    });

    const service = new (DatabaseService as any)(config) as DatabaseService & { options: unknown };

    expect(service.options).toEqual({
      connectionString: 'postgres://prod:5432/authz',
      maxPoolSize: 50,
      ssl: true,
      slowQueryThresholdMs: 0,
    });
  });

  it('sets slowQueryThresholdMs to 0', () => {
    const config = makeFakeConfig();
    const service = new (DatabaseService as any)(config) as DatabaseService & { options: unknown };

    expect((service.options as any).slowQueryThresholdMs).toBe(0);
  });

  it('calls ping on module init', async () => {
    const config = makeFakeConfig();
    const service = new (DatabaseService as any)(config) as DatabaseService;
    const pingSpy = vi.spyOn(service, 'ping');

    await service.onModuleInit();

    expect(pingSpy).toHaveBeenCalledOnce();
  });
});
