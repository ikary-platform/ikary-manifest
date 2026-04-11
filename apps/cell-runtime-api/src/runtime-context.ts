import type { DatabaseService } from '@ikary/system-db-core';
import type { CellManifestV1 } from '@ikary/contract';
import type { CellRuntimeDatabase } from '@ikary/cell-runtime-core';
import type { SystemLogDatabaseSchema } from '@ikary/system-log-core/server';

export const RUNTIME_CONTEXT_TOKEN = 'RUNTIME_CONTEXT';

/** Combined DB schema: entity tables + log tables, shared by the same PostgreSQL instance. */
export type AppDatabase = CellRuntimeDatabase & SystemLogDatabaseSchema;

export interface RuntimeContext {
  dbService: DatabaseService<AppDatabase>;
  manifest: CellManifestV1;
}
