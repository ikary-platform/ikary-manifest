import { z } from 'zod';

// Per-type config schemas (Zod-compliant, replaces z.record(z.unknown()))
export const uiSinkConfigSchema = z.object({});
export type UiSinkConfig = z.infer<typeof uiSinkConfigSchema>;

export const persistentSinkConfigSchema = z.object({});
export type PersistentSinkConfig = z.infer<typeof persistentSinkConfigSchema>;

export const externalSinkConfigSchema = z.object({
  endpoint: z.string().url(),
  headers: z.record(z.string()).optional(),
  timeoutMs: z.number().int().positive().default(5000),
});
export type ExternalSinkConfig = z.infer<typeof externalSinkConfigSchema>;

export const logSinkSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  workspaceId: z.string().uuid().nullable().optional(),
  cellId: z.string().uuid().nullable().optional(),
  scope: z.enum(['tenant', 'workspace', 'cell']),
  sinkType: z.enum(['ui', 'persistent', 'external']),
  retentionHours: z.number().int().positive(),
  config: z.unknown(),
  isEnabled: z.boolean(),
  version: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type LogSink = z.infer<typeof logSinkSchema>;

export const createLogSinkSchema = z.discriminatedUnion('sinkType', [
  z.object({
    sinkType: z.literal('ui'),
    scope: z.enum(['tenant', 'workspace', 'cell']),
    retentionHours: z.number().int().positive(),
    config: uiSinkConfigSchema.default({}),
    workspaceId: z.string().uuid().optional(),
    cellId: z.string().uuid().optional(),
  }),
  z.object({
    sinkType: z.literal('persistent'),
    scope: z.enum(['tenant', 'workspace', 'cell']),
    retentionHours: z.number().int().positive(),
    config: persistentSinkConfigSchema.default({}),
    workspaceId: z.string().uuid().optional(),
    cellId: z.string().uuid().optional(),
  }),
  z.object({
    sinkType: z.literal('external'),
    scope: z.enum(['tenant', 'workspace', 'cell']),
    retentionHours: z.number().int().positive(),
    config: externalSinkConfigSchema,
    workspaceId: z.string().uuid().optional(),
    cellId: z.string().uuid().optional(),
  }),
]);
export type CreateLogSink = z.infer<typeof createLogSinkSchema>;

export const updateLogSinkSchema = z.object({
  retentionHours: z.number().int().positive().optional(),
  config: z.unknown().optional(),
  isEnabled: z.boolean().optional(),
  expectedVersion: z.number().int().min(1),
});
export type UpdateLogSink = z.infer<typeof updateLogSinkSchema>;
