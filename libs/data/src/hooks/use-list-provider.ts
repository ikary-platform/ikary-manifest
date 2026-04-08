import type { EntityRouteParams } from '@ikary/contract';
import type { DataProviderDefinition } from '@ikary/contract';
import { useDataHooks } from '../data-hooks';
import { resolveIdFrom } from '../resolve-id-from';

export function useListProvider(
  provider: DataProviderDefinition & { mode: 'list' },
  primaryRecord: Record<string, unknown> | null,
  routeParams: Omit<EntityRouteParams, 'entityKey'>,
): { data: Record<string, unknown>[]; isLoading: boolean; error: unknown } {
  const { useCellEntityList } = useDataHooks();
  const filterValue = provider.filterBy ? resolveIdFrom(primaryRecord ?? {}, provider.filterBy.valueFrom) : undefined;

  const filter =
    provider.filterBy && filterValue !== undefined
      ? {
          logic: 'and' as const,
          rules: [
            {
              field: provider.filterBy.field,
              operator: 'eq' as const,
              value: filterValue,
            },
          ],
        }
      : undefined;

  const params: EntityRouteParams = { ...routeParams, entityKey: provider.entityKey };
  const query = {
    pageSize: provider.query?.pageSize,
    sortField: provider.query?.sortField,
    sortDir: provider.query?.sortDir,
    filter,
  };
  const [response, isLoading, error] = useCellEntityList(params, query);

  return { data: response.data as Record<string, unknown>[], isLoading, error };
}
