// ── Utilities ────────────────────────────────────────────────────────────────
export { generateCorrelationId } from './correlation-id';
export { CellApiError } from './cell-api-error';
export { cellApiFetch } from './cell-api-client';
export type { CellApiFetchOptions } from './cell-api-client';

// ── Context ──────────────────────────────────────────────────────────────────
export { CellApiProvider, useCellApi } from './cell-api-context';
export type { CellApiContextValue } from './cell-api-context';

// ── Query keys ───────────────────────────────────────────────────────────────
export { cellEntityQueryKeys } from './cell-entity-query-keys';

// ── URL builders ─────────────────────────────────────────────────────────────
export { localEntityBaseUrl, localEntityItemUrl } from './local-routes';

// ── Read hooks ───────────────────────────────────────────────────────────────
export { useCellEntityList } from './hooks/use-cell-entity-list';
export { useCellEntityGetOne } from './hooks/use-cell-entity-get-one';
export { useCellEntityAuditLog } from './hooks/use-cell-entity-audit-log';
export type { AuditLogEntry, AuditLogPage } from './hooks/use-cell-entity-audit-log';

// ── Mutation hooks ───────────────────────────────────────────────────────────
export { useCellEntityCreate } from './hooks/use-cell-entity-create';
export { useCellEntityUpdate } from './hooks/use-cell-entity-update';
export type { UpdateVars } from './hooks/use-cell-entity-update';
export { useCellEntityDelete } from './hooks/use-cell-entity-delete';
export { useCellEntityRollback } from './hooks/use-cell-entity-rollback';
export type { RollbackVars } from './hooks/use-cell-entity-rollback';
