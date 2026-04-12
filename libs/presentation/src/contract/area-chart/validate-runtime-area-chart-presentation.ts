import type { ZodIssue } from 'zod';
import { AreaChartPresentationSchema, type AreaChartPresentation } from './AreaChartPresentationSchema';

export type AreaChartRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeAreaChartPresentationResult =
  | { ok: true; value: AreaChartPresentation; errors: [] }
  | { ok: false; errors: AreaChartRuntimeValidationError[] };

export function validateRuntimeAreaChartPresentation(input: unknown): ValidateRuntimeAreaChartPresentationResult {
  const parsed = AreaChartPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeAreaChartPresentation(input: unknown): AreaChartPresentation {
  return AreaChartPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): AreaChartRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
