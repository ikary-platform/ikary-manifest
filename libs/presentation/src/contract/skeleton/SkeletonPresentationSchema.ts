import { z } from 'zod';

export const SkeletonPresentationSchema = z
  .object({
    count: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Number of skeleton rows to render; defaults to 1'),
    heightClass: z
      .string()
      .optional()
      .describe('Tailwind height utility class applied to each row, e.g. "h-4"'),
    widthClass: z
      .string()
      .optional()
      .describe('Tailwind width utility class applied to each row, e.g. "w-full"'),
  })
  .strict();

export type SkeletonPresentation = z.infer<typeof SkeletonPresentationSchema>;
