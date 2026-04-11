import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService as CoreDatabaseService, type Queryable as CoreQueryable } from '@ikary/system-db-core';
import { AuthConfigService } from '../config/auth-config.service';
import type { AuthDatabaseSchema } from './schema';

@Injectable()
export class DatabaseService extends CoreDatabaseService<AuthDatabaseSchema> implements OnModuleInit {
  constructor(@Inject(AuthConfigService) private readonly config: AuthConfigService) {
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

  now(): Date {
    return new Date();
  }

  bool(value: boolean): boolean {
    return value;
  }
}

export type Queryable = CoreQueryable<AuthDatabaseSchema>;
