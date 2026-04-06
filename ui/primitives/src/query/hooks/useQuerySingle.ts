// Compatibility wrapper — maps QueryDefinition (mode:'single') → GetParams
// and delegates to useEntityRecord.
import { useEntityRecord } from './useEntityRecord';
import type { QueryDefinition } from '../queryEngine';
import type { GetParams } from '../shared/get';

export function useQuerySingle<T = Record<string, unknown>>(query: QueryDefinition) {
  const filterId = query.filter?.['id'];
  const id = typeof filterId === 'string' ? filterId : '';

  const params: GetParams = {
    entity: query.entity,
    id,
  };

  const result = useEntityRecord<T>(params);

  return {
    record: result.data ?? null,
    loading: result.isLoading,
    error: result.error?.message ?? null,
  };
}
