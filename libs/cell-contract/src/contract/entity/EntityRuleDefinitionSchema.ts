import { z } from 'zod';
import { ValidationSeveritySchema } from '../../shared/ValidationSeveritySchema';

export const EntityRuleDefinitionSchema = z.object({
  ruleId: z.string().min(1),
  type: z.literal('entity_invariant'),
  paths: z.array(z.string()).min(1),
  messageKey: z.string().min(1),
  defaultMessage: z.string().optional(),
  clientSafe: z.boolean(),
  blocking: z.boolean(),
  severity: ValidationSeveritySchema,
  validatorRef: z.string().optional(),
});
