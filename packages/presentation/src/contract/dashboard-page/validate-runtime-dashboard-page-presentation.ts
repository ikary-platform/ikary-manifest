import type { ZodIssue } from 'zod';
import { DashboardPagePresentationSchema, type DashboardPagePresentation } from './DashboardPagePresentationSchema';

export type DashboardPageRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeDashboardPagePresentationResult =
  | {
      ok: true;
      value: DashboardPagePresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: DashboardPageRuntimeValidationError[];
    };

export function validateRuntimeDashboardPagePresentation(
  input: unknown,
): ValidateRuntimeDashboardPagePresentationResult {
  const parsed = DashboardPagePresentationSchema.safeParse(input);

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

export function parseRuntimeDashboardPagePresentation(input: unknown): DashboardPagePresentation {
  return DashboardPagePresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): DashboardPageRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
