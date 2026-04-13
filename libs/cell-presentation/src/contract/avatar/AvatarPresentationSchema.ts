import { z } from 'zod';

export const AvatarPresentationSchema = z
  .object({
    src: z.string().url().optional().describe('Image URL; when omitted the fallback is shown'),
    alt: z.string().optional().describe('Image alt text for accessibility'),
    fallback: z
      .string()
      .min(1)
      .optional()
      .describe('Short text (usually initials) shown when the image is absent or fails to load'),
    size: z
      .enum(['sm', 'md', 'lg'])
      .optional()
      .describe('Avatar diameter: sm=32px, md=40px, lg=56px; defaults to "md"'),
  })
  .strict();

export type AvatarPresentation = z.infer<typeof AvatarPresentationSchema>;
