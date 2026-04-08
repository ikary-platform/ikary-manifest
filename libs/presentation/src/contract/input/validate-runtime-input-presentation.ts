import type { ZodIssue } from 'zod';
import { InputPresentationSchema, type InputPresentation } from './InputPresentationSchema';

export type InputRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeInputPresentationResult =
  | {
      ok: true;
      value: InputPresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: InputRuntimeValidationError[];
    };

export function validateRuntimeInputPresentation(input: unknown): ValidateRuntimeInputPresentationResult {
  const parsed = InputPresentationSchema.safeParse(input);

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

export function parseRuntimeInputPresentation(input: unknown): InputPresentation {
  return InputPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): InputRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
