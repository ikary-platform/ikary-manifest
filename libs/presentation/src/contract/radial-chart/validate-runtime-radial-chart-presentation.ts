import type { ZodIssue } from 'zod';
import { RadialChartPresentationSchema, type RadialChartPresentation } from './RadialChartPresentationSchema';

export type RadialChartRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeRadialChartPresentationResult =
  | { ok: true; value: RadialChartPresentation; errors: [] }
  | { ok: false; errors: RadialChartRuntimeValidationError[] };

export function validateRuntimeRadialChartPresentation(input: unknown): ValidateRuntimeRadialChartPresentationResult {
  const parsed = RadialChartPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeRadialChartPresentation(input: unknown): RadialChartPresentation {
  return RadialChartPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): RadialChartRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
