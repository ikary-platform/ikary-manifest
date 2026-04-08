import { z } from 'zod';
import { ValidationScopeSchema } from './ValidationScopeSchema';
import { ValidationSeveritySchema } from '../shared/ValidationSeveritySchema';

export const ValidationIssueSchema = z.object({
  code: z.string().min(1),
  scope: ValidationScopeSchema,
  entity: z.string().min(1),
  ruleId: z.string().min(1),
  messageKey: z.string().min(1),
  defaultMessage: z.string().optional(),
  path: z.string().optional(),
  paths: z.array(z.string()).optional(),
  severity: ValidationSeveritySchema,
  blocking: z.boolean(),
  retryable: z.boolean(),
  meta: z.record(z.unknown()).optional(),
});
