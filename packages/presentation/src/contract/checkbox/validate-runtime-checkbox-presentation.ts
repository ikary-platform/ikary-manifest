import type { ZodIssue } from 'zod';
import { CheckboxPresentationSchema, type CheckboxPresentation } from './CheckboxPresentationSchema';

export type CheckboxRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeCheckboxPresentationResult =
  | {
      ok: true;
      value: CheckboxPresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: CheckboxRuntimeValidationError[];
    };

export function validateRuntimeCheckboxPresentation(input: unknown): ValidateRuntimeCheckboxPresentationResult {
  const parsed = CheckboxPresentationSchema.safeParse(input);

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

export function parseRuntimeCheckboxPresentation(input: unknown): CheckboxPresentation {
  return CheckboxPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): CheckboxRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
