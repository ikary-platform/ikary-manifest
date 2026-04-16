import { z } from 'zod';

export const KpiTrendSchema = z
  .object({
    direction: z.enum(['up', 'down', 'neutral']),
    value: z.string().min(1),
    label: z.string().optional(),
  })
  .strict();

export const KpiItemSchema = z
  .object({
    label: z.string().min(1),
    value: z.string().min(1),
    description: z.string().optional(),
    helper: z.string().optional(),
    trend: KpiTrendSchema.optional(),
    tone: z.enum(['default', 'positive', 'negative', 'warning']).default('default'),
  })
  .strict();

export const KpiClusterPresentationSchema = z
  .object({
    title: z.string().optional(),
    kpis: z.array(KpiItemSchema).min(1).max(8),
    columns: z.enum(['auto', '2', '3', '4']).default('auto'),
  })
  .strict();

export type KpiClusterProps = z.infer<typeof KpiClusterPresentationSchema>;
export type KpiItem = z.infer<typeof KpiItemSchema>;
export type KpiTrend = z.infer<typeof KpiTrendSchema>;
