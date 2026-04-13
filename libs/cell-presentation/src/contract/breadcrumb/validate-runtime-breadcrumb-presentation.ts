import type { ZodIssue } from 'zod';
import { BreadcrumbPresentationSchema, type BreadcrumbPresentation } from './BreadcrumbPresentationSchema';

export type BreadcrumbRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeBreadcrumbPresentationResult =
  | { ok: true; value: BreadcrumbPresentation; errors: [] }
  | { ok: false; errors: BreadcrumbRuntimeValidationError[] };

export function validateRuntimeBreadcrumbPresentation(input: unknown): ValidateRuntimeBreadcrumbPresentationResult {
  const parsed = BreadcrumbPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeBreadcrumbPresentation(input: unknown): BreadcrumbPresentation {
  return BreadcrumbPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): BreadcrumbRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
