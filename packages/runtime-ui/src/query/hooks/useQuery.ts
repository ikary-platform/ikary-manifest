// Compatibility wrapper — keeps old DataTable/ActivityFeed code working.
// Maps QueryDefinition → ListParams and delegates to useEntityList.
import { useEntityList } from './useEntityList';
import type { QueryDefinition } from '../queryEngine';
import type { ListParams } from '../shared/list';
import type { FilterGroup } from '../shared/filters';

function flatFilterToGroup(flat?: Record<string, unknown>): FilterGroup | undefined {
  if (!flat || Object.keys(flat).length === 0) return undefined;
  const rules = Object.entries(flat)
    .filter(([, v]) => v !== undefined && v !== null && typeof v !== 'object')
    .map(([field, value]) => ({ field, op: 'eq' as const, value }));
  if (rules.length === 0) return undefined;
  return { logic: 'and', filters: rules };
}

export function useQuery<T = Record<string, unknown>>(query: QueryDefinition) {
  const page = query.offset && query.limit ? Math.floor(query.offset / query.limit) + 1 : 1;
  const pageSize = query.limit ?? 20;

  const params: ListParams = {
    entity: query.entity,
    filter: flatFilterToGroup(query.filter),
    sort: query.sort ? [query.sort] : undefined,
    page,
    pageSize,
  };

  const result = useEntityList<T>(params);

  // Map ListResult back to the old { data, total } shape
  return {
    data: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    loading: result.isLoading,
    error: result.error?.message ?? null,
  };
}
