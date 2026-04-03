import { z } from 'zod';

export const DomainEventEntityRefSchema = z.object({
  type: z.string().min(1),
  id: z.string().min(1),
});

export type DomainEventEntityRef = z.infer<typeof DomainEventEntityRefSchema>;
