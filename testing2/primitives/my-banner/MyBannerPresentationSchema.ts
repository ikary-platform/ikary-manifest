import { z } from 'zod';

export const MyBannerPresentationSchema = z.object({
  // TODO: add your props here
  label: z.string().optional(),
}).strict();

export type MyBannerProps = z.infer<typeof MyBannerPresentationSchema>;
