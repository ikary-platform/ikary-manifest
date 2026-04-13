import { z } from 'zod';

export const CardPresentationSchema = z
  .object({
    title: z.string().optional().describe('Card header title'),
    description: z
      .string()
      .optional()
      .describe('Subtitle shown below the title in muted text'),
    content: z.string().optional().describe('Main body text of the card'),
    footer: z.string().optional().describe('Footer line at the bottom of the card'),
  })
  .strict();

export type CardPresentation = z.infer<typeof CardPresentationSchema>;
