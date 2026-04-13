import type { ZodIssue } from 'zod';
import { SeparatorPresentationSchema, type SeparatorPresentation } from './SeparatorPresentationSchema';

export type SeparatorRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeSeparatorPresentationResult =
  | { ok: true; value: SeparatorPresentation; errors: [] }
  | { ok: false; errors: SeparatorRuntimeValidationError[] };

export function validateRuntimeSeparatorPresentation(input: unknown): ValidateRuntimeSeparatorPresentationResult {
  const parsed = SeparatorPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeSeparatorPresentation(input: unknown): SeparatorPresentation {
  return SeparatorPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): SeparatorRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
