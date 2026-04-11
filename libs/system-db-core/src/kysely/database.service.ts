import { Kysely, sql, type Transaction } from 'kysely';
import type { DatabaseConnectionOptions } from '../config/database.schema.js';
import { createDialect } from './plugins.js';
import { createQueryLogger } from './slow-query.plugin.js';
import type { KyselyDatabaseProvider } from './types.js';

export class DatabaseService<DB extends object = Record<string, never>>
  implements KyselyDatabaseProvider<DB>
{
  readonly db: Kysely<DB>;

  constructor(options: DatabaseConnectionOptions) {
    this.db = new Kysely<DB>({
      dialect: createDialect(options),
      ...(options.slowQueryThresholdMs > 0
        ? { log: createQueryLogger({ thresholdMs: options.slowQueryThresholdMs }) }
        : {}),
    });
  }

  async ping(): Promise<void> {
    await sql`select 1`.execute(this.db);
  }

  withTransaction<T>(handler: (trx: Transaction<DB>) => Promise<T>): Promise<T> {
    return this.db.transaction().execute(handler);
  }

  async destroy(): Promise<void> {
    await this.db.destroy();
  }
}
