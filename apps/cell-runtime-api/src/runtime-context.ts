import type { DatabaseService } from '@ikary/system-db-core';
import type { CellManifestV1 } from '@ikary/contract';
import type { CellRuntimeDatabase } from '@ikary/cell-runtime-core';

export const RUNTIME_CONTEXT_TOKEN = 'RUNTIME_CONTEXT';

export interface RuntimeContext {
  dbService: DatabaseService<CellRuntimeDatabase>;
  manifest: CellManifestV1;
}
