import type { ZodIssue } from 'zod';
import { MetricCardPresentationSchema, type MetricCardPresentation } from './MetricCardPresentationSchema';

export type MetricCardRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeMetricCardPresentationResult =
  | {
      ok: true;
      value: MetricCardPresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: MetricCardRuntimeValidationError[];
    };

export function validateRuntimeMetricCardPresentation(input: unknown): ValidateRuntimeMetricCardPresentationResult {
  const parsed = MetricCardPresentationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      errors: toRuntimeErrors(parsed.error.issues),
    };
  }

  return {
    ok: true,
    value: parsed.data,
    errors: [],
  };
}

export function parseRuntimeMetricCardPresentation(input: unknown): MetricCardPresentation {
  return MetricCardPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): MetricCardRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
