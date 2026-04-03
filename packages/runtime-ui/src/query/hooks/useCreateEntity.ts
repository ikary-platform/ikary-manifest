import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRuntimeContext } from '../../context/RuntimeContextProvider';
import { getEntityClient } from '../clients/index';
import { entityKeys } from '../cache/queryKeys';

export function useCreateEntity<TInput extends Record<string, unknown>, TOutput = TInput>(entity: string) {
  const context = useRuntimeContext();
  const client = getEntityClient(context);
  const queryClient = useQueryClient();
  const wsId = context.workspaceId ?? 'playground';

  return useMutation({
    mutationFn: (input: TInput) => client.create<TInput, TOutput>(context, entity, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...entityKeys.lists(), wsId, entity],
      });
    },
  });
}
