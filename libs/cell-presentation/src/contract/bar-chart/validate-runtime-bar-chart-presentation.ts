import type { ZodIssue } from 'zod';
import { BarChartPresentationSchema, type BarChartPresentation } from './BarChartPresentationSchema';

export type BarChartRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeBarChartPresentationResult =
  | { ok: true; value: BarChartPresentation; errors: [] }
  | { ok: false; errors: BarChartRuntimeValidationError[] };

export function validateRuntimeBarChartPresentation(input: unknown): ValidateRuntimeBarChartPresentationResult {
  const parsed = BarChartPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeBarChartPresentation(input: unknown): BarChartPresentation {
  return BarChartPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): BarChartRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
