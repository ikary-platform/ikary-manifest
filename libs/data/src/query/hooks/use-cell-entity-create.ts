import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { EntityRouteParams, EntityItemResponse } from '@ikary/contract';
import { cellEntityQueryKeys } from '../cell-entity-query-keys';
import { cellApiFetch } from '../cell-api-client';
import { useCellApi } from '../cell-api-context';
import { localEntityBaseUrl } from '../local-routes';
import type { CellApiError } from '../cell-api-error';

type CellMutationTuple<TData, TVars> = [
  (vars: TVars) => Promise<TData>,
  boolean,
  CellApiError | null,
  UseMutationResult<TData, CellApiError, TVars>,
];

export function useCellEntityCreate<T = Record<string, unknown>>(
  params: EntityRouteParams,
): CellMutationTuple<EntityItemResponse<T>, Record<string, unknown>> {
  const { apiBase, getToken } = useCellApi();
  const queryClient = useQueryClient();

  const mutation = useMutation<EntityItemResponse<T>, CellApiError, Record<string, unknown>>({
    mutationFn: (data) => {
      const url = localEntityBaseUrl(params.entityKey, apiBase);
      return cellApiFetch<EntityItemResponse<T>>({ url, method: 'POST', body: data, token: getToken() });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.lists(params) });
    },
  });

  return [mutation.mutateAsync, mutation.isPending, mutation.error ?? null, mutation];
}
