import type { EntityRouteParams } from './entity-routes.contract';

/**
 * Returns the collection URL for the given entity.
 *
 * @example
 * entityBaseUrl({ tenantId: 't1', workspaceId: 'w1', cellKey: 'crm', entityKey: 'contact' })
 * // → "/v1/tenants/t1/workspaces/w1/cells/crm/entities/contact"
 */
export function entityBaseUrl(params: EntityRouteParams, apiBase = ''): string {
  const { tenantId, workspaceId, cellKey, entityKey } = params;
  return `${apiBase}/v1/tenants/${tenantId}/workspaces/${workspaceId}/cells/${cellKey}/entities/${entityKey}`;
}

/**
 * Returns the item URL for the given entity id.
 *
 * @example
 * entityItemUrl({ tenantId: 't1', workspaceId: 'w1', cellKey: 'crm', entityKey: 'contact', id: 'abc' })
 * // → "/v1/tenants/t1/workspaces/w1/cells/crm/entities/contact/abc"
 */
export function entityItemUrl(params: EntityRouteParams & { id: string }, apiBase = ''): string {
  return `${entityBaseUrl(params, apiBase)}/${params.id}`;
}
