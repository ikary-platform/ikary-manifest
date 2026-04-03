import { z } from 'zod';
import { PolicyScopeSchema } from './PolicyScopeSchema';

/**
 * ActionPolicySchema
 * Purpose: reusable policy rule for entity- and field-level actions.
 */
export const ActionPolicySchema = z
  .object({
    scope: PolicyScopeSchema,
    condition: z.string().min(1).optional(),
  })
  .strict();

export type ActionPolicy = z.infer<typeof ActionPolicySchema>;
