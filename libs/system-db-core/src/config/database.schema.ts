import { z } from 'zod';

export const databaseConnectionOptionsSchema = z.object({
  /**
   * Connection string with dialect prefix.
   * - SQLite (local/testing): `sqlite://:memory:` or `sqlite:///abs/path/to/db.sqlite`
   * - PostgreSQL (production): `postgres://user:pass@host:5432/db`
   */
  connectionString: z.string().min(1),
  maxPoolSize: z.number().int().positive().default(20),
  ssl: z.boolean().default(false),
  /** Queries exceeding this threshold (ms) are logged as slow. 0 = disabled. */
  slowQueryThresholdMs: z.number().int().min(0).default(0),
});

export type DatabaseConnectionOptions = z.infer<typeof databaseConnectionOptionsSchema>;
