import { z } from 'zod';
import { ValidationSeveritySchema } from '../../shared/ValidationSeveritySchema';

export const CrossEntityValidatorRefSchema = z.object({
  ruleId: z.string().min(1),
  type: z.enum(['cross_entity', 'lifecycle', 'persistence_preview']),
  validatorRef: z.string().min(1),
  messageKey: z.string().min(1),
  defaultMessage: z.string().optional(),
  clientSafe: z.literal(false),
  async: z.literal(true),
  blocking: z.boolean(),
  severity: ValidationSeveritySchema,
  targetPaths: z.array(z.string()).optional(),
});
