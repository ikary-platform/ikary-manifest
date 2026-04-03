import { z } from 'zod';
import { FieldRuleDefinitionSchema } from './FieldRuleDefinitionSchema';

export const FieldValidationSchema = z.object({
  fieldRules: z.array(FieldRuleDefinitionSchema).optional(),
});
