export { resolveIdFrom } from './resolve-id-from';
export { useRelationRuntime } from './useRelationRuntime';
export type { UseRelationRuntimeOptions } from './useRelationRuntime';
export { derivePageDataContext } from './derive-page-data-context';
export type { PrimaryDataContext } from './derive-page-data-context';
export { deriveRelationProviders } from './derive-relation-providers';
export { useSingleProvider } from './use-single-provider';
export { useListProvider } from './use-list-provider';
export { useSecondaryProviders } from './use-secondary-providers';
export { EntityRegistryProvider, useEntityRegistry, useEntityRegistryOptional } from './EntityRegistryContext';
export type { EntityRegistry } from './EntityRegistryContext';
export { CellPageDataProvider } from './CellPageDataProvider';
export type { CellPageDataProviderProps } from './CellPageDataProvider';
export { CellBlockDataProvider } from './CellBlockDataProvider';
export type { CellBlockDataProviderProps } from './CellBlockDataProvider';
export { JustInTimeDataProvider } from './JustInTimeDataProvider';
export type { JustInTimeDataProviderProps } from './JustInTimeDataProvider';

// ── Data hooks abstraction ────────────────────────────────────────────────────
export type { CellDataHooks, CellEntityQueryKeys, EntityListQuery, CellApiFetchOptions } from './data-hooks';
export { DataHooksProvider, useDataHooks } from './data-hooks';
export { mockDataHooks } from './mock-data-hooks';
export { liveDataHooks } from './live-data-hooks';

// ── Query layer (React Query entity hooks) ───────────────────────────────────
export {
  // Utilities
  generateCorrelationId,
  CellApiError,
  cellApiFetch,
  // Context
  CellApiProvider,
  useCellApi,
  // Query keys
  cellEntityQueryKeys,
  // URL builders
  localEntityBaseUrl,
  localEntityItemUrl,
  // Read hooks
  useCellEntityList,
  useCellEntityGetOne,
  useCellEntityAuditLog,
  // Mutation hooks
  useCellEntityCreate,
  useCellEntityUpdate,
  useCellEntityDelete,
  useCellEntityRollback,
} from './query';
export type {
  CellApiContextValue,
  AuditLogEntry,
  AuditLogPage,
  UpdateVars,
  RollbackVars,
} from './query';
