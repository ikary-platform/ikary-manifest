import type { ZodIssue } from 'zod';
import { SelectPresentationSchema, type SelectPresentation } from './SelectPresentationSchema';

export type SelectRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeSelectPresentationResult =
  | {
      ok: true;
      value: SelectPresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: SelectRuntimeValidationError[];
    };

export function validateRuntimeSelectPresentation(input: unknown): ValidateRuntimeSelectPresentationResult {
  const parsed = SelectPresentationSchema.safeParse(input);

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

export function parseRuntimeSelectPresentation(input: unknown): SelectPresentation {
  return SelectPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): SelectRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
