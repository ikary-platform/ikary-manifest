import { z } from 'zod';

export const DashboardHeroMetaItemSchema = z
  .object({
    label: z.string().min(1),
    value: z.string().min(1),
  })
  .strict();

export const DashboardHeroPresentationSchema = z
  .object({
    title: z.string().min(1),
    eyebrow: z.string().optional(),
    subtitle: z.string().optional(),
    meta: z.array(DashboardHeroMetaItemSchema).max(6).optional(),
    tone: z.enum(['default', 'subtle', 'emphasis']).default('default'),
  })
  .strict();

export type DashboardHeroProps = z.infer<typeof DashboardHeroPresentationSchema>;
export type DashboardHeroMetaItem = z.infer<typeof DashboardHeroMetaItemSchema>;
