import { z } from 'zod';
import { EntityRuleDefinitionSchema } from './EntityRuleDefinitionSchema';
import { CrossEntityValidatorRefSchema } from './CrossEntityValidatorRefSchema';

/**
 * EntityValidationSchema
 * Purpose: validates entity-scoped and server-scoped validation declarations.
 */
export const EntityValidationSchema = z
  .object({
    entityRules: z.array(EntityRuleDefinitionSchema).optional(),
    serverValidators: z.array(CrossEntityValidatorRefSchema).optional(),
  })
  .strict()
  .refine(
    (value) => value.entityRules !== undefined || value.serverValidators !== undefined,
    'EntityValidationSchema must define at least entityRules or serverValidators',
  );

export type EntityValidation = z.infer<typeof EntityValidationSchema>;
