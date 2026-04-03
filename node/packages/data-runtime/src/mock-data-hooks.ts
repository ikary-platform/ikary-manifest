import type { CellDataHooks } from './data-hooks';
import type { EntityRouteParams } from '@ikary-manifest/contract';

/**
 * No-op implementation of `CellDataHooks`.
 *
 * Use this when running standalone (without an enterprise API backend) or
 * in unit tests where API calls should be replaced by explicit mock overrides.
 *
 * Every hook returns an empty/idle result and never initiates a network call.
 */
export const mockDataHooks: CellDataHooks = {
  useCellEntityGetOne: (_params: EntityRouteParams, _id: string | null) => [null, false, null],

  useCellEntityList: (_params: EntityRouteParams, _query) => [
    { data: [], total: 0, page: 1, pageSize: 20, hasMore: false },
    false,
    null,
  ],

  useCellApi: () => ({
    apiBase: '',
    getToken: () => null,
  }),

  cellEntityQueryKeys: {
    detail: (params: EntityRouteParams, id: string) => ['cell', params.entityKey, 'detail', id],
    list: (params: EntityRouteParams, query) => ['cell', params.entityKey, 'list', query],
  },

  cellApiFetch: async <T>(_options: { url: string; method: string; token: unknown }): Promise<T> => {
    return undefined as unknown as T;
  },
};
