import type { ZodIssue } from 'zod';
import { BulkCommandBarPresentationSchema, type BulkCommandBarPresentation } from './BulkCommandBarPresentationSchema';

export type BulkCommandBarRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeBulkCommandBarPresentationResult =
  | {
      ok: true;
      value: BulkCommandBarPresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: BulkCommandBarRuntimeValidationError[];
    };

export function validateRuntimeBulkCommandBarPresentation(
  input: unknown,
): ValidateRuntimeBulkCommandBarPresentationResult {
  const parsed = BulkCommandBarPresentationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      errors: toRuntimeErrors(parsed.error.issues),
    };
  }

  return {
    ok: true,
    value: parsed.data,
    errors: [],
  };
}

export function parseRuntimeBulkCommandBarPresentation(input: unknown): BulkCommandBarPresentation {
  return BulkCommandBarPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): BulkCommandBarRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
