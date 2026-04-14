import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BrandingDataHooks } from '../hooks/branding-data-hooks.js';
import type { CellBranding } from '../../shared/cell-branding.schema.js';
import type {
  PatchCellBrandingInput,
  ResetCellBrandingInput,
} from '../../shared/cell-branding.requests.js';

export interface LiveBrandingHooksOptions {
  apiBase: string;
  routePrefix?: string;
  getToken?: () => string | null | undefined;
  fetchImpl?: typeof fetch;
}

function makeUrl(apiBase: string, routePrefix: string, cellId: string, suffix = ''): string {
  const base = apiBase.replace(/\/$/, '');
  return `${base}/${routePrefix}/${encodeURIComponent(cellId)}/branding${suffix}`;
}

async function request<T>(
  url: string,
  method: string,
  body: unknown,
  fetchImpl: typeof fetch,
  token: string | null | undefined,
): Promise<T> {
  const response = await fetchImpl(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Branding API ${method} ${url} failed: ${response.status} ${text}`);
  }
  const payload = (await response.json()) as { data: T };
  return payload.data;
}

export function createLiveBrandingHooks(options: LiveBrandingHooksOptions): BrandingDataHooks {
  const { apiBase } = options;
  const routePrefix = options.routePrefix ?? 'cells';
  const fetchImpl = options.fetchImpl ?? fetch;
  const getToken = options.getToken ?? (() => null);

  const queryKey = (cellId: string) => ['cell-branding', 'live', apiBase, cellId] as const;

  return {
    useBranding(cellId) {
      const query = useQuery<CellBranding>({
        queryKey: queryKey(cellId),
        queryFn: () =>
          request<CellBranding>(
            makeUrl(apiBase, routePrefix, cellId),
            'GET',
            undefined,
            fetchImpl,
            getToken(),
          ),
        enabled: Boolean(cellId),
        staleTime: 5_000,
      });
      return [query.data ?? null, query.isLoading, query.error] as const;
    },
    useUpdateBranding() {
      const queryClient = useQueryClient();
      const mutation = useMutation<
        CellBranding,
        Error,
        { cellId: string; input: PatchCellBrandingInput }
      >({
        mutationFn: ({ cellId, input }) =>
          request<CellBranding>(
            makeUrl(apiBase, routePrefix, cellId),
            'PATCH',
            input,
            fetchImpl,
            getToken(),
          ),
        onSuccess: (data, { cellId }) => {
          queryClient.setQueryData(queryKey(cellId), data);
        },
      });
      return (cellId: string, input: PatchCellBrandingInput) =>
        mutation.mutateAsync({ cellId, input });
    },
    useResetBranding() {
      const queryClient = useQueryClient();
      const mutation = useMutation<
        CellBranding,
        Error,
        { cellId: string; input: ResetCellBrandingInput }
      >({
        mutationFn: ({ cellId, input }) =>
          request<CellBranding>(
            makeUrl(apiBase, routePrefix, cellId, '/reset'),
            'POST',
            input,
            fetchImpl,
            getToken(),
          ),
        onSuccess: (data, { cellId }) => {
          queryClient.setQueryData(queryKey(cellId), data);
        },
      });
      return (cellId: string, input: ResetCellBrandingInput) =>
        mutation.mutateAsync({ cellId, input });
    },
    brandingQueryKeys: {
      detail: (cellId: string) => [...queryKey(cellId)],
    },
  };
}
