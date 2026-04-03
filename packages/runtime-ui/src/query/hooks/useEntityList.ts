import { useQuery as tanstackUseQuery } from '@tanstack/react-query';
import { useRuntimeContext } from '../../context/RuntimeContextProvider';
import { getEntityClient } from '../clients/index';
import { entityKeys } from '../cache/queryKeys';
import type { ListParams } from '../shared/list';

export function useEntityList<T = Record<string, unknown>>(params: ListParams) {
  const context = useRuntimeContext();
  const client = getEntityClient(context);
  const wsId = context.workspaceId ?? 'playground';

  return tanstackUseQuery({
    queryKey: entityKeys.list(wsId, params),
    queryFn: ({ signal }) => client.list<T>(context, params, signal),
  });
}
