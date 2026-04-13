import type { ZodIssue } from 'zod';
import { ProgressPresentationSchema, type ProgressPresentation } from './ProgressPresentationSchema';

export type ProgressRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeProgressPresentationResult =
  | { ok: true; value: ProgressPresentation; errors: [] }
  | { ok: false; errors: ProgressRuntimeValidationError[] };

export function validateRuntimeProgressPresentation(input: unknown): ValidateRuntimeProgressPresentationResult {
  const parsed = ProgressPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeProgressPresentation(input: unknown): ProgressPresentation {
  return ProgressPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): ProgressRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
