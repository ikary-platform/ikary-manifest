import { z } from 'zod';

export const DomainEventActorTypeSchema = z.enum(['user', 'system', 'workflow', 'api']);

export type DomainEventActorType = z.infer<typeof DomainEventActorTypeSchema>;
