export interface EntityRuntimeContext {
  actorId?: string;
  requestId?: string;
  /** Multi-tenancy dimensions — populated by the platform, nullable in local/preview mode. */
  tenantId?: string;
  workspaceId?: string;
  cellId?: string;
  /** Manifest-declared event names for this entity (from entity.events.names). */
  eventNames?: {
    created?: string;
    updated?: string;
    deleted?: string;
    rolled_back?: string;
  };
  /** Fields to strip from event payloads (from entity.events.exclude). */
  excludeFields?: string[];
}
