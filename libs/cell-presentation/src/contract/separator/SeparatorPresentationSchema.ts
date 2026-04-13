import { z } from 'zod';

export const SeparatorPresentationSchema = z
  .object({
    orientation: z
      .enum(['horizontal', 'vertical'])
      .optional()
      .describe('Separator direction; defaults to "horizontal"'),
    decorative: z
      .boolean()
      .optional()
      .describe('When true, hides from accessibility tree (aria-hidden)'),
  })
  .strict();

export type SeparatorPresentation = z.infer<typeof SeparatorPresentationSchema>;
