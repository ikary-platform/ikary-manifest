import type { ZodIssue } from 'zod';
import { DateInputPresentationSchema, type DateInputPresentation } from './DateInputPresentationSchema';

export type DateInputRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeDateInputPresentationResult =
  | {
      ok: true;
      value: DateInputPresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: DateInputRuntimeValidationError[];
    };

export function validateRuntimeDateInputPresentation(input: unknown): ValidateRuntimeDateInputPresentationResult {
  const parsed = DateInputPresentationSchema.safeParse(input);

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

export function parseRuntimeDateInputPresentation(input: unknown): DateInputPresentation {
  return DateInputPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): DateInputRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
