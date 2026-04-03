import { z } from 'zod';

export const DataProviderSchema = z
  .object({
    key: z.string().min(1),
    entityKey: z.string().min(1),
    mode: z.enum(['single', 'list']),
    idFrom: z.string().optional(),
    filterBy: z
      .object({
        field: z.string().min(1),
        valueFrom: z.string().min(1),
      })
      .optional(),
    query: z
      .object({
        pageSize: z.number().optional(),
        sortField: z.string().optional(),
        sortDir: z.enum(['asc', 'desc']).optional(),
      })
      .optional(),
  })
  .strict();

export type DataProviderDefinition = z.infer<typeof DataProviderSchema>;
