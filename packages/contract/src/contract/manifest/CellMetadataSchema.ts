import { z } from 'zod';

export const CellMetadataSchema = z
  .object({
    key: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    version: z.string().min(1),
  })
  .strict();

export type CellMetadata = z.infer<typeof CellMetadataSchema>;
