import type { ZodIssue } from 'zod';
import { RadarChartPresentationSchema, type RadarChartPresentation } from './RadarChartPresentationSchema';

export type RadarChartRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeRadarChartPresentationResult =
  | { ok: true; value: RadarChartPresentation; errors: [] }
  | { ok: false; errors: RadarChartRuntimeValidationError[] };

export function validateRuntimeRadarChartPresentation(input: unknown): ValidateRuntimeRadarChartPresentationResult {
  const parsed = RadarChartPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeRadarChartPresentation(input: unknown): RadarChartPresentation {
  return RadarChartPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): RadarChartRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
