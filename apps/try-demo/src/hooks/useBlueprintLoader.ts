import { useMutation } from '@tanstack/react-query';
import { fetchBlueprintManifest } from '../stream/demo-api';

export interface UseBlueprintLoaderReturn {
  load: (blueprintId: string) => Promise<{ blueprintId: string; manifest: unknown }>;
  loadingId: string | null;
  error: Error | null;
}

/**
 * On-demand manifest loader for a single blueprint. Exposes which id is
 * currently loading so cards can render a spinner without owning the
 * request state themselves.
 */
export function useBlueprintLoader(): UseBlueprintLoaderReturn {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const manifest = await fetchBlueprintManifest(id);
      return { blueprintId: id, manifest };
    },
  });
  return {
    load: (id) => mutation.mutateAsync(id),
    loadingId: mutation.isPending ? (mutation.variables ?? null) : null,
    error: (mutation.error as Error | null) ?? null,
  };
}
