import { z } from 'zod';

export const entityRouteParamsSchema = z.object({
  tenantId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  cellKey: z.string().min(1),
  entityKey: z.string().min(1),
});

export type EntityRouteParams = z.infer<typeof entityRouteParamsSchema>;

export const ENTITY_ROUTE_PREFIX = 'v1/tenants/:tenantId/workspaces/:workspaceId/cells/:cellKey/entities/:entityKey';
