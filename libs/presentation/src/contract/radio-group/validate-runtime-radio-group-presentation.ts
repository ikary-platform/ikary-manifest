import type { ZodIssue } from 'zod';
import { RadioGroupPresentationSchema, type RadioGroupPresentation } from './RadioGroupPresentationSchema';

export type RadioGroupRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeRadioGroupPresentationResult =
  | {
      ok: true;
      value: RadioGroupPresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: RadioGroupRuntimeValidationError[];
    };

export function validateRuntimeRadioGroupPresentation(input: unknown): ValidateRuntimeRadioGroupPresentationResult {
  const parsed = RadioGroupPresentationSchema.safeParse(input);

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

export function parseRuntimeRadioGroupPresentation(input: unknown): RadioGroupPresentation {
  return RadioGroupPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): RadioGroupRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
