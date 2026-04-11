import { z } from 'zod';

export const upsertPermissionAssignmentSchema = z.object({
  tenantId: z.string().uuid(),
  workspaceId: z.string().uuid().nullable().optional(),
  cellId: z.string().uuid().nullable().optional(),
  targetType: z.enum(['USER', 'ROLE', 'GROUP']),
  targetId: z.string().uuid(),
  scopeType: z.enum(['FEATURE', 'DOMAIN']),
  scopeCode: z.string().trim().min(1).max(150),
  accessLevel: z.number().int().min(0).max(4),
});
