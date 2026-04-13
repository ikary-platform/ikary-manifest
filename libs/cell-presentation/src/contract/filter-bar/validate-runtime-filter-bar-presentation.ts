import type { ZodIssue } from 'zod';
import { FilterBarPresentationSchema, type FilterBarPresentation } from './FilterBarPresentationSchema';

export type FilterBarRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeFilterBarPresentationResult =
  | {
      ok: true;
      value: FilterBarPresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: FilterBarRuntimeValidationError[];
    };

export function validateRuntimeFilterBarPresentation(input: unknown): ValidateRuntimeFilterBarPresentationResult {
  const parsed = FilterBarPresentationSchema.safeParse(input);

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

export function parseRuntimeFilterBarPresentation(input: unknown): FilterBarPresentation {
  return FilterBarPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): FilterBarRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
