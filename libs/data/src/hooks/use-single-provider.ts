import type { EntityRouteParams } from '@ikary/contract';
import type { DataProviderDefinition } from '@ikary/contract';
import { useDataHooks } from '../data-hooks';
import { resolveIdFrom } from '../resolve-id-from';

export function useSingleProvider(
  provider: DataProviderDefinition & { mode: 'single' },
  primaryRecord: Record<string, unknown> | null,
  routeParams: Omit<EntityRouteParams, 'entityKey'>,
): { data: Record<string, unknown> | null; isLoading: boolean; error: unknown } {
  const { useCellEntityGetOne } = useDataHooks();
  const id = provider.idFrom ? resolveIdFrom(primaryRecord ?? {}, provider.idFrom) : undefined;
  const params: EntityRouteParams = { ...routeParams, entityKey: provider.entityKey };
  const [response, isLoading, error] = useCellEntityGetOne(params, id ?? null);

  return { data: (response?.data as Record<string, unknown> | null) ?? null, isLoading, error };
}
