import { useQueries } from '@tanstack/react-query';
import type {
  EntityRouteParams,
  EntityItemResponse,
  EntityListResponse,
} from '@ikary/cell-contract';
import { entityItemUrl, entityBaseUrl } from '@ikary/cell-contract';
import type { DataProviderDefinition } from '@ikary/cell-contract';
import { useDataHooks } from '../data-hooks';
import { resolveIdFrom } from '../resolve-id-from';

export function useSecondaryProviders(
  providers: DataProviderDefinition[],
  primaryRecord: Record<string, unknown> | null,
  routeParams: Omit<EntityRouteParams, 'entityKey'>,
): {
  mergedData: Record<string, unknown>;
  isLoading: boolean;
  errors: unknown[];
} {
  const { useCellApi, cellEntityQueryKeys, cellApiFetch } = useDataHooks();
  const { apiBase, getToken } = useCellApi();

  const results = useQueries({
    queries: providers.map((provider) => {
      const params: EntityRouteParams = { ...routeParams, entityKey: provider.entityKey };

      if (provider.mode === 'single') {
        const id = provider.idFrom ? resolveIdFrom(primaryRecord ?? {}, provider.idFrom) : undefined;

        return {
          queryKey: cellEntityQueryKeys.detail(params, id ?? ''),
          queryFn: () =>
            cellApiFetch<EntityItemResponse<Record<string, unknown>>>({
              url: entityItemUrl({ ...params, id: id! }, apiBase),
              method: 'GET',
              token: getToken(),
            }),
          enabled: Boolean(id),
        };
      }

      const filterValue = provider.filterBy
        ? resolveIdFrom(primaryRecord ?? {}, provider.filterBy.valueFrom)
        : undefined;

      const filter =
        provider.filterBy && filterValue !== undefined
          ? {
              logic: 'and' as const,
              rules: [{ field: provider.filterBy.field, operator: 'eq' as const, value: filterValue }],
            }
          : undefined;

      const query = {
        pageSize: provider.query?.pageSize,
        sortField: provider.query?.sortField,
        sortDir: provider.query?.sortDir,
        filter,
      };

      const paramsString = new URLSearchParams();
      if (query.pageSize !== undefined) paramsString.set('pageSize', String(query.pageSize));
      if (query.sortField) paramsString.set('sortField', query.sortField);
      if (query.sortDir) paramsString.set('sortDir', query.sortDir);
      if (query.filter) paramsString.set('filter', JSON.stringify(query.filter));
      const qs = paramsString.toString();

      return {
        queryKey: cellEntityQueryKeys.list(params, query),
        queryFn: () => {
          const base = entityBaseUrl(params, apiBase);
          const url = qs ? `${base}?${qs}` : base;
          return cellApiFetch<EntityListResponse<Record<string, unknown>>>({
            url,
            method: 'GET',
            token: getToken(),
          });
        },
      };
    }),
  });

  const isLoading = results.some((result) => result.isLoading);
  const errors = results.map((result) => result.error ?? null);

  const mergedData = providers.reduce<Record<string, unknown>>((acc, provider, index) => {
    const result = results[index];
    if (!result?.data) return acc;

    if (provider.mode === 'single') {
      acc[provider.key] = (result.data as EntityItemResponse<Record<string, unknown>>).data;
    } else {
      acc[provider.key] = (result.data as EntityListResponse<Record<string, unknown>>).data;
    }
    return acc;
  }, {});

  return { mergedData, isLoading, errors };
}
