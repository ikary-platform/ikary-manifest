import { useQuery } from '@tanstack/react-query';
import type { BlueprintMetadata } from '@ikary/cell-ai';
import { fetchBlueprints } from '../stream/demo-api';

export interface UseBlueprintsReturn {
  data: BlueprintMetadata[] | undefined;
  isPending: boolean;
  error: Error | null;
}

/**
 * Loads the list of curated blueprints once; cache is permanent (list is
 * static inside a given deploy). Consumers render a grid from `data`.
 */
export function useBlueprints(): UseBlueprintsReturn {
  const query = useQuery({
    queryKey: ['blueprints'],
    queryFn: ({ signal }) => fetchBlueprints(signal),
    staleTime: Infinity,
    retry: 1,
  });
  return {
    data: query.data,
    isPending: query.isPending,
    error: query.error as Error | null,
  };
}
