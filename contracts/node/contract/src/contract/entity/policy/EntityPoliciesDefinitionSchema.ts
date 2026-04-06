import { z } from 'zod';
import { ActionPolicySchema } from './ActionPolicySchema';

/**
 * EntityPoliciesDefinitionSchema
 * Purpose: validates per-entity action policy requirements.
 */
export const EntityPoliciesDefinitionSchema = z
  .object({
    view: ActionPolicySchema.optional(),
    create: ActionPolicySchema.optional(),
    update: ActionPolicySchema.optional(),
    delete: ActionPolicySchema.optional(),
  })
  .strict();

export type EntityPoliciesDefinition = z.infer<typeof EntityPoliciesDefinitionSchema>;
