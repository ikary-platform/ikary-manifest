import { createRequire } from 'node:module';
import { PostgresDialect, SqliteDialect } from 'kysely';
import type { DatabaseConnectionOptions } from '../config/database.schema.js';

// When bundled as CJS by tsup, import.meta is replaced with {} and .url is undefined.
// Fall back to a file:// URL derived from process.cwd() so createRequire always gets
// a valid base path for resolving native dependencies.
/* v8 ignore next */
const _metaUrl = (import.meta as { url?: string }).url ?? `file://${process.cwd()}/`;
const require = createRequire(_metaUrl);

export function createDialect(options: DatabaseConnectionOptions): PostgresDialect | SqliteDialect {
  if (options.connectionString.startsWith('sqlite://')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SQLite = require('better-sqlite3') as new (filename: string, opts?: any) => any;
    const filename = options.connectionString.replace('sqlite://', '');
    return new SqliteDialect({ database: new SQLite(filename) });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { Pool } = require('pg') as any;
  return new PostgresDialect({
    pool: new Pool({
      connectionString: options.connectionString,
      max: options.maxPoolSize,
      ssl: options.ssl ? { rejectUnauthorized: false } : undefined,
    }),
  });
}
