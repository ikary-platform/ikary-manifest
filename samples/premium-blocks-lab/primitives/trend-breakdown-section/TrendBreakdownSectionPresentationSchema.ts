import { z } from 'zod';

export const TrendBreakdownSectionPresentationSchema = z
  .object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    density: z.enum(['default', 'compact']).default('default'),
    breakdownPosition: z.enum(['left', 'right']).default('right'),
  })
  .strict();

export type TrendBreakdownSectionProps = z.infer<typeof TrendBreakdownSectionPresentationSchema>;
