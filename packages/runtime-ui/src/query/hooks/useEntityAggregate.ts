import { useQuery as tanstackUseQuery } from '@tanstack/react-query';
import { useRuntimeContext } from '../../context/RuntimeContextProvider';
import { getEntityClient } from '../clients/index';
import { entityKeys } from '../cache/queryKeys';
import type { AggregateParams } from '../shared/aggregate';

export function useEntityAggregate(params: AggregateParams) {
  const context = useRuntimeContext();
  const client = getEntityClient(context);
  const wsId = context.workspaceId ?? 'playground';

  return tanstackUseQuery({
    queryKey: entityKeys.aggregate(wsId, params),
    queryFn: ({ signal }) => client.aggregate(context, params, signal),
  });
}
