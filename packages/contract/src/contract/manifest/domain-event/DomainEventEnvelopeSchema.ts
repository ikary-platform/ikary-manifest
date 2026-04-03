import { z } from 'zod';
import { DomainEventActorSchema } from './DomainEventActorSchema';
import { DomainEventEntityRefSchema } from './DomainEventEntityRefSchema';

export const DomainEventEnvelopeSchema = z.object({
  event_id: z.string().min(1),
  event_name: z.string().min(1),
  version: z.number().int().positive(),
  timestamp: z.string().min(1),
  tenant_id: z.string().min(1),
  workspace_id: z.string().min(1),
  cell_id: z.string().min(1),
  actor: DomainEventActorSchema,
  entity: DomainEventEntityRefSchema,
  data: z.record(z.unknown()),
  previous: z.record(z.unknown()),
  metadata: z.record(z.unknown()),
});

export type DomainEventEnvelope = z.infer<typeof DomainEventEnvelopeSchema>;
