import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { EntityRouteParams } from '@ikary/cell-contract';
import { cellEntityQueryKeys } from '../cell-entity-query-keys';
import { cellApiFetch } from '../cell-api-client';
import { useCellApi } from '../cell-api-context';
import { localEntityItemUrl } from '../local-routes';
import type { CellApiError } from '../cell-api-error';

interface EntityDeleteResponse {
  data: { id: string; deleted: boolean };
}

type CellMutationTuple<TData, TVars> = [
  (vars: TVars) => Promise<TData>,
  boolean,
  CellApiError | null,
  UseMutationResult<TData, CellApiError, TVars>,
];

export function useCellEntityDelete(
  params: EntityRouteParams,
): CellMutationTuple<EntityDeleteResponse, string> {
  const { apiBase, getToken } = useCellApi();
  const queryClient = useQueryClient();

  const mutation = useMutation<EntityDeleteResponse, CellApiError, string>({
    mutationFn: (id) => {
      const url = localEntityItemUrl(params.entityKey, id, apiBase);
      return cellApiFetch<EntityDeleteResponse>({ url, method: 'DELETE', token: getToken() });
    },
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.lists(params) });
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.detail(params, id) });
    },
  });

  return [mutation.mutateAsync, mutation.isPending, mutation.error ?? null, mutation];
}
