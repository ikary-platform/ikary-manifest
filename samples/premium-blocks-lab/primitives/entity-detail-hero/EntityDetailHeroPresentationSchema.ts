import { z } from 'zod';

export const EntityDetailHeroStatusSchema = z
  .object({
    label: z.string().min(1),
    tone: z.enum(['neutral', 'positive', 'warning', 'danger']).default('neutral'),
  })
  .strict();

export const EntityDetailHeroPresentationSchema = z
  .object({
    name: z.string().min(1),
    subtitle: z.string().optional(),
    avatarUrl: z.string().url().optional(),
    avatarFallback: z.string().max(4).optional(),
    status: EntityDetailHeroStatusSchema.optional(),
  })
  .strict();

export type EntityDetailHeroProps = z.infer<typeof EntityDetailHeroPresentationSchema>;
export type EntityDetailHeroStatus = z.infer<typeof EntityDetailHeroStatusSchema>;
