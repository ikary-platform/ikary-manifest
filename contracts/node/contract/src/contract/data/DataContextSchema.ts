import { z } from 'zod';

export const DataContextSchema = z
  .object({
    entityKey: z.string().min(1),
    idParam: z.string().min(1).default('id'),
  })
  .strict();

export type DataContextDefinition = z.infer<typeof DataContextSchema>;
