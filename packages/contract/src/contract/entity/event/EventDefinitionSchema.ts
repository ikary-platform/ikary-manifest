import { z } from 'zod';

/**
 * EventDefinitionSchema
 * Purpose: validates per-entity event naming and field exclusion rules.
 */
export const EventDefinitionSchema = z
  .object({
    exclude: z
      .array(z.string().min(1))
      .optional()
      .refine((values) => !values || new Set(values).size === values.length, 'exclude must contain unique field names'),

    names: z
      .object({
        created: z.string().min(1).optional(),
        updated: z.string().min(1).optional(),
        deleted: z.string().min(1).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type EventDefinition = z.infer<typeof EventDefinitionSchema>;
