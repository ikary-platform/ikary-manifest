import { z } from 'zod';

export const MyBanner2PresentationSchema = z.object({
  // TODO: add your props here
  label: z.string().optional(),
}).strict();

export type MyBanner2Props = z.infer<typeof MyBanner2PresentationSchema>;
