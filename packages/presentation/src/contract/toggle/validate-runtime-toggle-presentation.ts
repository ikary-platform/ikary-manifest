import type { ZodIssue } from 'zod';
import { TogglePresentationSchema, type TogglePresentation } from './TogglePresentationSchema';

export type ToggleRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeTogglePresentationResult =
  | {
      ok: true;
      value: TogglePresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: ToggleRuntimeValidationError[];
    };

export function validateRuntimeTogglePresentation(input: unknown): ValidateRuntimeTogglePresentationResult {
  const parsed = TogglePresentationSchema.safeParse(input);

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

export function parseRuntimeTogglePresentation(input: unknown): TogglePresentation {
  return TogglePresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): ToggleRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
