import { z } from 'zod';

export const blueprintMetadataSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  source: z.string().min(1),
});
export type BlueprintMetadata = z.infer<typeof blueprintMetadataSchema>;
