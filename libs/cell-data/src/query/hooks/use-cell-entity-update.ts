import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { EntityRouteParams, EntityItemResponse } from '@ikary/cell-contract';
import { cellEntityQueryKeys } from '../cell-entity-query-keys';
import { cellApiFetch } from '../cell-api-client';
import { useCellApi } from '../cell-api-context';
import { localEntityItemUrl } from '../local-routes';
import type { CellApiError } from '../cell-api-error';

type CellMutationTuple<TData, TVars> = [
  (vars: TVars) => Promise<TData>,
  boolean,
  CellApiError | null,
  UseMutationResult<TData, CellApiError, TVars>,
];

export interface UpdateVars {
  id: string;
  data: Record<string, unknown>;
  expectedVersion?: number;
}

export function useCellEntityUpdate<T = Record<string, unknown>>(
  params: EntityRouteParams,
): CellMutationTuple<EntityItemResponse<T>, UpdateVars> {
  const { apiBase, getToken } = useCellApi();
  const queryClient = useQueryClient();

  const mutation = useMutation<EntityItemResponse<T>, CellApiError, UpdateVars>({
    mutationFn: ({ id, data, expectedVersion }) => {
      const url = localEntityItemUrl(params.entityKey, id, apiBase);
      const body = expectedVersion !== undefined ? { ...data, expectedVersion } : data;
      return cellApiFetch<EntityItemResponse<T>>({ url, method: 'PATCH', body, token: getToken() });
    },
    onSuccess: async (_, vars) => {
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.lists(params) });
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.detail(params, vars.id) });
    },
  });

  return [mutation.mutateAsync, mutation.isPending, mutation.error ?? null, mutation];
}
