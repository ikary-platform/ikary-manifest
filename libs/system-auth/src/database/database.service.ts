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

  /** Returns a date value compatible with the current dialect (ISO string for SQLite, Date for PG). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  now(): any {
    return this.isSqlite ? new Date().toISOString() : new Date();
  }

  /** Returns a boolean value compatible with the current dialect (0/1 for SQLite, true/false for PG). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bool(value: boolean): any {
    return this.isSqlite ? (value ? 1 : 0) : value;
  }
}

export type Queryable = CoreQueryable<AuthDatabaseSchema>;
