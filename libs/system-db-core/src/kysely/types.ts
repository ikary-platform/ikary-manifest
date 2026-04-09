import type { Generated, Kysely, Transaction } from 'kysely';

export type Queryable<DB extends object = Record<string, never>> = Kysely<DB> | Transaction<DB>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CrossSchemaQueryable = Kysely<any> | Transaction<any>;

export interface KyselyDatabaseProvider<DB extends object = Record<string, never>> {
  readonly db: Kysely<DB>;
  withTransaction<T>(handler: (trx: Transaction<DB>) => Promise<T>): Promise<T>;
  destroy(): Promise<void>;
}

export type TimestampColumn = Generated<Date>;
