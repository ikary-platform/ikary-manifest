import type { ZodIssue } from 'zod';
import { LineChartPresentationSchema, type LineChartPresentation } from './LineChartPresentationSchema';

export type LineChartRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeLineChartPresentationResult =
  | { ok: true; value: LineChartPresentation; errors: [] }
  | { ok: false; errors: LineChartRuntimeValidationError[] };

export function validateRuntimeLineChartPresentation(input: unknown): ValidateRuntimeLineChartPresentationResult {
  const parsed = LineChartPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeLineChartPresentation(input: unknown): LineChartPresentation {
  return LineChartPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): LineChartRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
