import { z } from 'zod';

export const BadgePresentationSchema = z
  .object({
    label: z.string().min(1).describe('Badge text content'),
    variant: z
      .enum(['default', 'secondary', 'destructive', 'outline'])
      .optional()
      .describe('Visual style variant; defaults to "default"'),
  })
  .strict();

export type BadgePresentation = z.infer<typeof BadgePresentationSchema>;
