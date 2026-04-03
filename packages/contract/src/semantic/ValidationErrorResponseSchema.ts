import { z } from 'zod';
import { ValidationIssueSchema } from './ValidationIssueSchema';

export const ValidationErrorResponseSchema = z.object({
  error: z.literal('VALIDATION_FAILED'),
  requestId: z.string(),
  issues: z.array(ValidationIssueSchema),
});
