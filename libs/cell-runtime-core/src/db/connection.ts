import { Kysely, SqliteDialect, PostgresDialect } from 'kysely';
import type { CellRuntimeDatabase } from './schema.js';

export interface DatabaseConnection {
  db: Kysely<CellRuntimeDatabase>;
  isPostgres: boolean;
}

export function createDatabaseConnection(connectionString: string): DatabaseConnection {
  if (connectionString.startsWith('sqlite://')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SQLite = require('better-sqlite3');
    const filePath = connectionString.replace('sqlite://', '');
    const db = new Kysely<CellRuntimeDatabase>({
      dialect: new SqliteDialect({ database: new SQLite(filePath) }),
    });
    return { db, isPostgres: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require('pg');
  const db = new Kysely<CellRuntimeDatabase>({
    dialect: new PostgresDialect({ pool: new Pool({ connectionString }) }),
  });
  return { db, isPostgres: true };
}
