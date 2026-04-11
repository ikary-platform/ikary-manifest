import { z } from 'zod';

export const LabelPresentationSchema = z
  .object({
    text: z.string().min(1).describe('Visible label text'),
    htmlFor: z.string().min(1).optional().describe('id of the associated form control'),
    required: z.boolean().optional().describe('Appends a required marker (*) to the label'),
  })
  .strict();

export type LabelPresentation = z.infer<typeof LabelPresentationSchema>;
