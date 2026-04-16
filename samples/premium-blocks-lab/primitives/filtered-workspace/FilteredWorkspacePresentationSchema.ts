import { z } from 'zod';

export const FilteredWorkspacePresentationSchema = z
  .object({
    title: z.string().optional(),
    resultCount: z.number().int().nonnegative().optional(),
    isEmpty: z.boolean().default(false),
    isLoading: z.boolean().default(false),
    asidePosition: z.enum(['right', 'hidden']).default('right'),
  })
  .strict();

export type FilteredWorkspaceProps = z.infer<typeof FilteredWorkspacePresentationSchema>;
