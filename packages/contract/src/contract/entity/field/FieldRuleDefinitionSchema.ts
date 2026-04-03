import { z } from 'zod';
import { FieldRuleTypeSchema } from './FieldRuleTypeSchema';
import { ValidationSeveritySchema } from '../../../shared/ValidationSeveritySchema';

export const FieldRuleDefinitionSchema = z.object({
  ruleId: z.string().min(1),
  type: FieldRuleTypeSchema,
  field: z.string().min(1),
  messageKey: z.string().min(1),
  defaultMessage: z.string().optional(),
  params: z.record(z.unknown()).optional(),
  clientSafe: z.boolean(),
  blocking: z.boolean(),
  severity: ValidationSeveritySchema,
});
