import type { ZodIssue } from 'zod';
import type { ValidationError } from '../../shared/types';

/**
 * Converts Zod issues into the compiler-facing ValidationError shape.
 */
export function toStructuralValidationErrors(issues: readonly ZodIssue[]): ValidationError[] {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));
}
