import type { ZodIssue } from 'zod';
import { LabelPresentationSchema, type LabelPresentation } from './LabelPresentationSchema';

export type LabelRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeLabelPresentationResult =
  | { ok: true; value: LabelPresentation; errors: [] }
  | { ok: false; errors: LabelRuntimeValidationError[] };

export function validateRuntimeLabelPresentation(input: unknown): ValidateRuntimeLabelPresentationResult {
  const parsed = LabelPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeLabelPresentation(input: unknown): LabelPresentation {
  return LabelPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): LabelRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
