import { z } from 'zod';

export const ProgressPresentationSchema = z
  .object({
    value: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .describe('Completion percentage from 0 to 100; omit for indeterminate'),
    label: z.string().min(1).optional().describe('Accessible aria-label for screen readers'),
    showValue: z.boolean().optional().describe('Display the numeric percentage next to the bar'),
  })
  .strict();

export type ProgressPresentation = z.infer<typeof ProgressPresentationSchema>;
