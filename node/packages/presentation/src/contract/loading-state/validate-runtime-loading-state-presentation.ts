import type { ZodIssue } from 'zod';
import { LoadingStatePresentationSchema, type LoadingStatePresentation } from './LoadingStatePresentationSchema';

export type LoadingStateRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeLoadingStatePresentationResult =
  | {
      ok: true;
      value: LoadingStatePresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: LoadingStateRuntimeValidationError[];
    };

export function validateRuntimeLoadingStatePresentation(input: unknown): ValidateRuntimeLoadingStatePresentationResult {
  const parsed = LoadingStatePresentationSchema.safeParse(input);

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

export function parseRuntimeLoadingStatePresentation(input: unknown): LoadingStatePresentation {
  return LoadingStatePresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): LoadingStateRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
