import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRuntimeContext } from '../../context/RuntimeContextProvider';
import { getEntityClient } from '../clients/index';
import { entityKeys } from '../cache/queryKeys';

export function useDeleteEntity(entity: string) {
  const context = useRuntimeContext();
  const client = getEntityClient(context);
  const queryClient = useQueryClient();
  const wsId = context.workspaceId ?? 'playground';

  return useMutation({
    mutationFn: (id: string) => client.remove(context, entity, id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: [...entityKeys.lists(), wsId, entity] });
      void queryClient.removeQueries({ queryKey: entityKeys.record(wsId, entity, id) });
    },
  });
}
