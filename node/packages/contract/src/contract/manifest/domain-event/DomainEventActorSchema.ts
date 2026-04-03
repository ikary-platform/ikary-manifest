import { z } from 'zod';
import { DomainEventActorTypeSchema } from './DomainEventActorTypeSchema';

export const DomainEventActorSchema = z.object({
  type: DomainEventActorTypeSchema,
  id: z.string().min(1),
});

export type DomainEventActor = z.infer<typeof DomainEventActorSchema>;
