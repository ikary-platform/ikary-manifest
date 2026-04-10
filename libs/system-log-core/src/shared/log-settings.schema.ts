import { z } from 'zod';

export const logSettingsSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  workspaceId: z.string().uuid().nullable().optional(),
  cellId: z.string().uuid().nullable().optional(),
  scope: z.enum(['tenant', 'workspace', 'cell']),
  logLevel: z.enum(['verbose', 'normal', 'production']),
  version: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type LogSettings = z.infer<typeof logSettingsSchema>;

export const updateLogSettingsSchema = z.object({
  logLevel: z.enum(['verbose', 'normal', 'production']),
  expectedVersion: z.number().int().min(0),
});

export type UpdateLogSettings = z.infer<typeof updateLogSettingsSchema>;
