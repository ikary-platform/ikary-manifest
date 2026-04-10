import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { EntityRouteParams, EntityItemResponse } from '@ikary/contract';
import { cellEntityQueryKeys } from '../cell-entity-query-keys';
import { cellApiFetch } from '../cell-api-client';
import { useCellApi } from '../cell-api-context';
import { localEntityItemUrl } from '../local-routes';
import type { CellApiError } from '../cell-api-error';

type CellQueryTuple<T> = [T, boolean, CellApiError | null, UseQueryResult<T, CellApiError>];

export function useCellEntityGetOne<T = Record<string, unknown>>(
  params: EntityRouteParams,
  id: string | null | undefined,
): CellQueryTuple<EntityItemResponse<T> | null> {
  const { apiBase, getToken } = useCellApi();

  const result = useQuery<EntityItemResponse<T> | null, CellApiError>({
    queryKey: cellEntityQueryKeys.detail(params, id ?? ''),
    queryFn: () => {
      const url = localEntityItemUrl(params.entityKey, id!, apiBase);
      return cellApiFetch<EntityItemResponse<T>>({ url, method: 'GET', token: getToken() });
    },
    enabled: Boolean(params.entityKey) && Boolean(id),
  });

  return [result.data ?? null, result.isLoading, result.error ?? null, result];
}
