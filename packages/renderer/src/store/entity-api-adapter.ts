/**
 * EntityApiAdapter
 *
 * A framework-agnostic interface describing the data operations the API data
 * store needs for a single active entity.  Implementations are provided by the
 * consumer of the renderer (e.g. via @ikary/cell-runtime-api/ui hooks).
 *
 * This interface intentionally avoids any React Query or enterprise-package
 * types so the open-source renderer package has zero hard dependencies on them.
 */

export interface AuditLogEntry {
  id: string;
  eventType: string;
  resourceVersion: number;
  actorId: string | null;
  actorType: string;
  actorEmail: string | null;
  changeKind: string;
  snapshot: unknown;
  diff: unknown;
  occurredAt: string;
  requestId: string | null;
}

export interface AuditLogPage {
  data: AuditLogEntry[];
  total: number;
}

export interface UpdateVars {
  id: string;
  data: Record<string, unknown>;
  expectedVersion?: number;
}

export interface RollbackVars {
  id: string;
  targetVersion: number;
  expectedVersion?: number;
}

/**
 * Represents an item response envelope from the API.
 * The actual data lives under `data`.
 */
export interface EntityItemResponse<T = Record<string, unknown>> {
  data: T;
}

/**
 * Represents a list response envelope from the API.
 */
export interface EntityListResponse<T = Record<string, unknown>> {
  data: T[];
  total?: number;
}

/**
 * The adapter the API data store needs to interact with one active entity.
 * Pass an implementation of this interface to useCreateApiDataStore.
 *
 * In ikary-cell-ui (enterprise) this is implemented by wiring the
 * @ikary/cell-runtime-api/ui hooks.  In open-source contexts consumers can
 * implement their own fetch-based adapter.
 */
export interface EntityApiAdapter {
  /** List data for the active entity and whether the query is loading. */
  listData: EntityListResponse<Record<string, unknown>>;
  listLoading: boolean;

  /** Detail record for the currently selected record. */
  detailData: EntityItemResponse<Record<string, unknown>> | null;

  /** Audit log page result. */
  auditData: AuditLogPage | undefined;

  /** Mutation functions */
  createAsync: (data: Record<string, unknown>) => Promise<EntityItemResponse<Record<string, unknown>>>;
  updateAsync: (vars: UpdateVars) => Promise<EntityItemResponse<Record<string, unknown>> | undefined>;
  deleteAsync: (id: string) => Promise<unknown>;
  rollbackAsync: (vars: RollbackVars) => Promise<unknown>;

  /**
   * Called when the store wants to load a different entity or record.
   * The adapter should update its queries accordingly (e.g. by changing
   * the params passed to the underlying hooks).
   */
  setActiveEntity: (entityKey: string) => void;
  setActiveRecord: (entityKey: string, id: string) => void;
}
