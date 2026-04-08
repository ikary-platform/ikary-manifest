import type { Kysely } from 'kysely';
import type { CellManifestV1 } from '@ikary/contract';
import type { CellRuntimeDatabase } from '@ikary/cell-runtime-core';

export const RUNTIME_CONTEXT_TOKEN = 'RUNTIME_CONTEXT';

export interface RuntimeContext {
  db: Kysely<CellRuntimeDatabase>;
  manifest: CellManifestV1;
}
