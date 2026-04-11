import type { EntityRouteParams } from '@ikary/contract';
import type { EntityListQuery } from '../data-hooks';

/**
 * Hierarchical React Query key factory for entity operations.
 *
 * Keys are scoped by all route params (tenantId, workspaceId, cellKey,
 * entityKey) so multiple manifests / tenants can coexist with isolated caches.
 */
export const cellEntityQueryKeys = {
  all: (p: EntityRouteParams) =>
    ['cell-entity', p.tenantId, p.workspaceId, p.cellKey, p.entityKey] as const,

  lists: (p: EntityRouteParams) => [...cellEntityQueryKeys.all(p), 'list'] as const,

  list: (p: EntityRouteParams, q?: Partial<EntityListQuery>) =>
    [...cellEntityQueryKeys.lists(p), q ?? {}] as const,

  details: (p: EntityRouteParams) => [...cellEntityQueryKeys.all(p), 'detail'] as const,

  detail: (p: EntityRouteParams, id: string) =>
    [...cellEntityQueryKeys.details(p), id] as const,

  audit: (p: EntityRouteParams, id: string) =>
    [...cellEntityQueryKeys.all(p), 'audit', id] as const,
};
