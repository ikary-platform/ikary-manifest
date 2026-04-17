import { PostgresDialect } from 'kysely';
import pg from 'pg';
import type { DatabaseConnectionOptions } from '../config/database.schema.js';

export function createDialect(options: DatabaseConnectionOptions): PostgresDialect {
  const { Pool } = pg;
  return new PostgresDialect({
    pool: new Pool({
      connectionString: options.connectionString,
      max: options.maxPoolSize,
      ssl: options.ssl ? { rejectUnauthorized: false } : undefined,
    }),
  });
}
