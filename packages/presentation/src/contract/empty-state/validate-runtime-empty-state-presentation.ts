import type { ZodIssue } from 'zod';
import { EmptyStatePresentationSchema, type EmptyStatePresentation } from './EmptyStatePresentationSchema';

export type EmptyStateRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeEmptyStatePresentationResult =
  | {
      ok: true;
      value: EmptyStatePresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: EmptyStateRuntimeValidationError[];
    };

export function validateRuntimeEmptyStatePresentation(input: unknown): ValidateRuntimeEmptyStatePresentationResult {
  const parsed = EmptyStatePresentationSchema.safeParse(input);

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

export function parseRuntimeEmptyStatePresentation(input: unknown): EmptyStatePresentation {
  return EmptyStatePresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): EmptyStateRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
