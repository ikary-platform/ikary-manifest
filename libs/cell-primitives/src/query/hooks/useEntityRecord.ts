import { useQuery as tanstackUseQuery } from '@tanstack/react-query';
import { useRuntimeContext } from '../../context/RuntimeContextProvider';
import { getEntityClient } from '../clients/index';
import { entityKeys } from '../cache/queryKeys';
import type { GetParams } from '../shared/get';

export function useEntityRecord<T = Record<string, unknown>>(params: GetParams) {
  const context = useRuntimeContext();
  const client = getEntityClient(context);
  const wsId = context.workspaceId ?? 'playground';

  return tanstackUseQuery({
    queryKey: entityKeys.record(wsId, params.entity, params.id, params.fields),
    queryFn: ({ signal }) => client.get<T>(context, params, signal),
    enabled: Boolean(params.id),
  });
}
