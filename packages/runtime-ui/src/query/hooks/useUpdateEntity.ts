import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRuntimeContext } from '../../context/RuntimeContextProvider';
import { getEntityClient } from '../clients/index';
import { entityKeys } from '../cache/queryKeys';

export function useUpdateEntity<TInput extends Record<string, unknown>, TOutput = TInput>(entity: string) {
  const context = useRuntimeContext();
  const client = getEntityClient(context);
  const queryClient = useQueryClient();
  const wsId = context.workspaceId ?? 'playground';

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TInput> }) =>
      client.update<TInput, TOutput>(context, entity, id, input),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [...entityKeys.lists(), wsId, entity] });
      void queryClient.invalidateQueries({ queryKey: entityKeys.record(wsId, entity, id) });
    },
  });
}
