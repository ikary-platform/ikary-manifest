import { z } from 'zod';
import { ActionPolicySchema } from './ActionPolicySchema';

const FieldPolicyOverrideSchema = z
  .object({
    view: ActionPolicySchema.optional(),
    update: ActionPolicySchema.optional(),
  })
  .strict()
  .refine(
    (value) => value.view !== undefined || value.update !== undefined,
    'field policy override must define at least view or update',
  );

/**
 * FieldPoliciesDefinitionSchema
 * Purpose: validates per-field policy overrides for view/update access.
 *
 * Record key = field key
 */
export const FieldPoliciesDefinitionSchema = z.record(z.string().min(1), FieldPolicyOverrideSchema);

export type FieldPoliciesDefinition = z.infer<typeof FieldPoliciesDefinitionSchema>;
