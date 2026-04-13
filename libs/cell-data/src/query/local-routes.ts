/**
 * URL builders for the local cell-runtime-api.
 *
 * The local API uses a flat `/entities/{entityKey}/records` pattern (no
 * tenant / workspace / cell scoping).  A future "ikary-cloud" mode will use the
 * enterprise `entityBaseUrl()` from `@ikary/cell-contract` instead.
 */

export function localEntityBaseUrl(entityKey: string, apiBase: string): string {
  return `${apiBase}/entities/${entityKey}/records`;
}

export function localEntityItemUrl(entityKey: string, id: string, apiBase: string): string {
  return `${apiBase}/entities/${entityKey}/records/${id}`;
}
