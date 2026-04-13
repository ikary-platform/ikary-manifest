import type { CellDataHooks } from './data-hooks';
import { useCellEntityList } from './query/hooks/use-cell-entity-list';
import { useCellEntityGetOne } from './query/hooks/use-cell-entity-get-one';
import { useCellApi } from './query/cell-api-context';
import { cellEntityQueryKeys } from './query/cell-entity-query-keys';
import { cellApiFetch } from './query/cell-api-client';

/**
 * Live implementation of `CellDataHooks`.
 *
 * Uses the React Query entity hooks backed by `CellApiProvider`.
 * Requires a surrounding `<CellApiProvider>` in the tree — without it the
 * hooks throw at call-site.
 *
 * This is the counterpart to `mockDataHooks`, which returns empty/idle results
 * for standalone (playground) usage.
 */
export const liveDataHooks: CellDataHooks = {
  useCellEntityGetOne: (params, id) => {
    const [data, loading, error] = useCellEntityGetOne(params, id);
    return [data, loading, error] as const;
  },

  useCellEntityList: (params, query) => {
    const [data, loading, error] = useCellEntityList(params, query);
    return [data, loading, error] as const;
  },

  useCellApi: () => useCellApi(),

  cellEntityQueryKeys: {
    detail: (params, id) => [...cellEntityQueryKeys.detail(params, id)],
    list: (params, query) => [...cellEntityQueryKeys.list(params, query)],
  },

  cellApiFetch: <T>(options: { url: string; method: string; token: string | null | undefined }) =>
    cellApiFetch<T>({ ...options, token: options.token ?? null }),
};
