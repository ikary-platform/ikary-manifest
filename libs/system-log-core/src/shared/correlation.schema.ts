import { z } from 'zod';

export const correlationContextSchema = z.object({
  correlationId: z.string().uuid().nullish(),
  requestId: z.string().uuid().nullish(),
  traceId: z.string().nullish(),
});

export type CorrelationContext = z.infer<typeof correlationContextSchema>;
