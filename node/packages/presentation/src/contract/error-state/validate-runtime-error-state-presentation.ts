import type { ZodIssue } from 'zod';
import { ErrorStatePresentationSchema, type ErrorStatePresentation } from './ErrorStatePresentationSchema';

export type ErrorStateRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeErrorStatePresentationResult =
  | {
      ok: true;
      value: ErrorStatePresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: ErrorStateRuntimeValidationError[];
    };

export function validateRuntimeErrorStatePresentation(input: unknown): ValidateRuntimeErrorStatePresentationResult {
  const parsed = ErrorStatePresentationSchema.safeParse(input);

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

export function parseRuntimeErrorStatePresentation(input: unknown): ErrorStatePresentation {
  return ErrorStatePresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): ErrorStateRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
