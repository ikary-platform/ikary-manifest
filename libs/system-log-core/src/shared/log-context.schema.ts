import { z } from 'zod';

export const logContextSchema = z.object({
  operation: z.string().min(1),
  tenantId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().nullable().optional(),
  cellId: z.string().uuid().nullable().optional(),
  actorId: z.string().uuid().optional(),
  actorType: z.string().optional(),
  entityId: z.string().optional(),
  eventType: z.string().optional(),
  duration: z.number().nonnegative().optional(),
  errorCode: z.string().optional(),
  correlationId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type LogContext = z.infer<typeof logContextSchema>;
