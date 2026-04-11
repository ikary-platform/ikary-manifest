import { z } from 'zod';

export const createGroupSchema = z.object({
  tenantId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  code: z.string().trim().min(1).max(150),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(400).optional(),
});

export const assignUserGroupSchema = z.object({
  tenantId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  groupId: z.string().uuid(),
});
