import { z } from 'zod';

export const AlertPresentationSchema = z
  .object({
    variant: z
      .enum(['default', 'destructive'])
      .optional()
      .describe('Visual tone; "default" is neutral, "destructive" signals an error or warning'),
    title: z.string().min(1).optional().describe('Alert heading line'),
    description: z.string().min(1).optional().describe('Supporting detail text below the title'),
  })
  .strict();

export type AlertPresentation = z.infer<typeof AlertPresentationSchema>;
