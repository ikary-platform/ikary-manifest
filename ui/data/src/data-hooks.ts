import { createContext, useContext } from 'react';
import type { EntityRouteParams, EntityItemResponse, EntityListResponse } from '@ikary-manifest/contract';
import type { FilterGroup } from '@ikary-manifest/contract';

// ── Query types ───────────────────────────────────────────────────────────────

export interface EntityListQuery {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  filter?: FilterGroup;
}

// ── Query key helpers ─────────────────────────────────────────────────────────

export interface CellEntityQueryKeys {
  detail: (params: EntityRouteParams, id: string) => unknown[];
  list: (params: EntityRouteParams, query: EntityListQuery) => unknown[];
}

// ── Fetch helper ──────────────────────────────────────────────────────────────

export interface CellApiFetchOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token: string | null | undefined;
  body?: unknown;
}

// ── CellDataHooks interface ───────────────────────────────────────────────────

/**
 * Abstraction over the enterprise `@ikary/cell-runtime-api/ui` hooks.
 *
 * Consuming apps provide a concrete implementation via `DataHooksProvider`.
 * The open-source package ships with `mockDataHooks` for standalone use.
 */
export interface CellDataHooks {
  /**
   * Fetch a single entity record by id.
   *
   * Returns a tuple: `[response, isLoading, error]`.
   * Pass `null` as id to disable the query (returns `[null, false, null]`).
   */
  useCellEntityGetOne: (
    params: EntityRouteParams,
    id: string | null,
  ) => readonly [EntityItemResponse<Record<string, unknown>> | null, boolean, unknown];

  /**
   * Fetch a paginated/filtered list of entity records.
   *
   * Returns a tuple: `[response, isLoading, error]`.
   */
  useCellEntityList: (
    params: EntityRouteParams,
    query: EntityListQuery,
  ) => readonly [EntityListResponse<Record<string, unknown>>, boolean, unknown];

  /**
   * Returns the base URL of the API and a token getter for direct fetch calls.
   */
  useCellApi: () => { apiBase: string; getToken: () => string | null | undefined };

  /**
   * Stable query-key factories — must be deterministic for a given input.
   */
  cellEntityQueryKeys: CellEntityQueryKeys;

  /**
   * Low-level fetch helper. Returns a typed promise.
   */
  cellApiFetch: <T>(options: CellApiFetchOptions) => Promise<T>;
}

// ── React context ─────────────────────────────────────────────────────────────

const DataHooksCtx = createContext<CellDataHooks | null>(null);

export const DataHooksProvider = DataHooksCtx.Provider;

/**
 * Returns the nearest `CellDataHooks` implementation from context.
 *
 * Throws when called outside a `DataHooksProvider`.
 */
export function useDataHooks(): CellDataHooks {
  const ctx = useContext(DataHooksCtx);
  if (!ctx) {
    throw new Error(
      '[data-runtime] useDataHooks must be called inside a DataHooksProvider. ' +
        'Wrap your component tree with <DataHooksProvider value={...}> or use mockDataHooks for tests.',
    );
  }
  return ctx;
}
