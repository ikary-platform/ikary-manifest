import type { ListParams } from '../shared/list';
import type { AggregateParams } from '../shared/aggregate';

export const entityKeys = {
  all: ['entity'] as const,

  lists: () => [...entityKeys.all, 'list'] as const,
  list: (workspaceId: string, params: ListParams) =>
    [...entityKeys.lists(), workspaceId, params.entity, params] as const,

  records: () => [...entityKeys.all, 'record'] as const,
  record: (workspaceId: string, entity: string, id: string, fields?: string[]) =>
    [...entityKeys.records(), workspaceId, entity, id, fields ?? []] as const,

  aggregates: () => [...entityKeys.all, 'aggregate'] as const,
  aggregate: (workspaceId: string, params: AggregateParams) =>
    [...entityKeys.aggregates(), workspaceId, params.entity, params] as const,
};
