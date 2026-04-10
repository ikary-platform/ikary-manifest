import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { EntityRouteParams, EntityListResponse } from '@ikary/contract';
import type { EntityListQuery } from '../../data-hooks';
import { cellEntityQueryKeys } from '../cell-entity-query-keys';
import { cellApiFetch } from '../cell-api-client';
import { useCellApi } from '../cell-api-context';
import { localEntityBaseUrl } from '../local-routes';
import type { CellApiError } from '../cell-api-error';

type CellQueryTuple<T> = [T, boolean, CellApiError | null, UseQueryResult<T, CellApiError>];

function buildListParams(query: Partial<EntityListQuery>): URLSearchParams {
  const p = new URLSearchParams();
  if (query.page !== undefined) p.set('page', String(query.page));
  if (query.pageSize !== undefined) p.set('pageSize', String(query.pageSize));
  if (query.sortField) p.set('sortField', query.sortField);
  if (query.sortDir) p.set('sortDir', query.sortDir);
  if (query.search) p.set('search', query.search);
  if (query.filter) p.set('filter', JSON.stringify(query.filter));
  return p;
}

export function useCellEntityList<T = Record<string, unknown>>(
  params: EntityRouteParams,
  query: Partial<EntityListQuery> = {},
): CellQueryTuple<EntityListResponse<T>> {
  const { apiBase, getToken } = useCellApi();

  const result = useQuery<EntityListResponse<T>, CellApiError>({
    queryKey: cellEntityQueryKeys.list(params, query),
    queryFn: () => {
      const qs = buildListParams(query);
      const qsStr = qs.toString();
      const base = localEntityBaseUrl(params.entityKey, apiBase);
      const url = qsStr ? `${base}?${qsStr}` : base;
      return cellApiFetch<EntityListResponse<T>>({ url, method: 'GET', token: getToken() });
    },
  });

  const emptyList: EntityListResponse<T> = {
    data: [],
    total: 0,
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    hasMore: false,
  };

  return [result.data ?? emptyList, result.isLoading, result.error ?? null, result];
}
