import { z } from 'zod';

export const createRoleSchema = z.object({
  tenantId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  code: z.string().trim().min(1).max(150),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(400).optional(),
});

export const assignUserRoleSchema = z.object({
  tenantId: z.string().uuid(),
  workspaceId: z.string().uuid().nullable().optional(),
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export const unassignUserRoleSchema = assignUserRoleSchema;
