import type { ZodIssue } from 'zod';
import { PieChartPresentationSchema, type PieChartPresentation } from './PieChartPresentationSchema';

export type PieChartRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimePieChartPresentationResult =
  | { ok: true; value: PieChartPresentation; errors: [] }
  | { ok: false; errors: PieChartRuntimeValidationError[] };

export function validateRuntimePieChartPresentation(input: unknown): ValidateRuntimePieChartPresentationResult {
  const parsed = PieChartPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimePieChartPresentation(input: unknown): PieChartPresentation {
  return PieChartPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): PieChartRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
