import { z } from 'zod';

export const platformLogEntrySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  tenantSlug: z.string(),
  workspaceId: z.string().uuid().nullable().optional(),
  workspaceSlug: z.string().nullable().optional(),
  cellId: z.string().uuid().nullable().optional(),
  cellSlug: z.string().nullable().optional(),
  service: z.string(),
  operation: z.string(),
  level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
  message: z.string(),
  source: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  requestId: z.string().uuid().nullable().optional(),
  traceId: z.string().nullable().optional(),
  spanId: z.string().nullable().optional(),
  correlationId: z.string().uuid().nullable().optional(),
  actorId: z.string().uuid().nullable().optional(),
  actorType: z.string().nullable().optional(),
  sinkType: z.enum(['ui', 'persistent', 'external']),
  loggedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export type PlatformLogEntry = z.infer<typeof platformLogEntrySchema>;
