import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService as CoreDatabaseService, type Queryable } from '@ikary/system-db-core';
import { AuthorizationConfigService } from '../config/authorization-config.service';
import type { AuthorizationDatabaseSchema } from './schema';

@Injectable()
export class DatabaseService extends CoreDatabaseService<AuthorizationDatabaseSchema> implements OnModuleInit {
  constructor(@Inject(AuthorizationConfigService) private readonly config: AuthorizationConfigService) {
    super({
      connectionString: config.config.database.connectionString,
      maxPoolSize: config.config.database.maxPoolSize,
      ssl: config.config.database.ssl,
      slowQueryThresholdMs: 0,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ping();
  }
}

export type { Queryable };
