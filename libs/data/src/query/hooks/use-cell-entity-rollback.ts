import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { EntityRouteParams, EntityItemResponse } from '@ikary/contract';
import { cellEntityQueryKeys } from '../cell-entity-query-keys';
import { cellApiFetch } from '../cell-api-client';
import { useCellApi } from '../cell-api-context';
import { localEntityItemUrl } from '../local-routes';
import type { CellApiError } from '../cell-api-error';

export interface RollbackVars {
  id: string;
  targetVersion: number;
  expectedVersion?: number;
}

export function useCellEntityRollback<T = Record<string, unknown>>(params: EntityRouteParams) {
  const { apiBase, getToken } = useCellApi();
  const queryClient = useQueryClient();

  return useMutation<EntityItemResponse<T>, CellApiError, RollbackVars>({
    mutationFn: ({ id, targetVersion, expectedVersion }) => {
      const url = `${localEntityItemUrl(params.entityKey, id, apiBase)}/rollback`;
      const body: Record<string, unknown> = { targetVersion };
      if (expectedVersion !== undefined) body['expectedVersion'] = expectedVersion;
      return cellApiFetch<EntityItemResponse<T>>({ url, method: 'POST', body, token: getToken() });
    },
    onSuccess: async (_, vars) => {
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.lists(params) });
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.detail(params, vars.id) });
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.audit(params, vars.id) });
    },
  });
}
