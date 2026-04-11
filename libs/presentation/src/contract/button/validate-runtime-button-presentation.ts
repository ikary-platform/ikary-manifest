import type { ZodIssue } from 'zod';
import { ButtonPresentationSchema, type ButtonPresentation } from './ButtonPresentationSchema';

export type ButtonRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeButtonPresentationResult =
  | { ok: true; value: ButtonPresentation; errors: [] }
  | { ok: false; errors: ButtonRuntimeValidationError[] };

export function validateRuntimeButtonPresentation(input: unknown): ValidateRuntimeButtonPresentationResult {
  const parsed = ButtonPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeButtonPresentation(input: unknown): ButtonPresentation {
  return ButtonPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): ButtonRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
