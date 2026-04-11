import { z } from 'zod';

export const ButtonPresentationSchema = z
  .object({
    label: z.string().min(1).describe('Button text label'),
    variant: z
      .enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'])
      .optional()
      .describe('Visual style variant; defaults to "default"'),
    size: z
      .enum(['default', 'sm', 'lg', 'icon'])
      .optional()
      .describe('Button size; defaults to "default"'),
    disabled: z.boolean().optional(),
    loading: z.boolean().optional().describe('Shows a spinner and disables the button'),
    buttonType: z
      .enum(['button', 'submit', 'reset'])
      .optional()
      .describe('HTML button type attribute; defaults to "button"'),
  })
  .strict();

export type ButtonPresentation = z.infer<typeof ButtonPresentationSchema>;
