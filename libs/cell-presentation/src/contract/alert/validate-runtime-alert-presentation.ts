import type { ZodIssue } from 'zod';
import { AlertPresentationSchema, type AlertPresentation } from './AlertPresentationSchema';

export type AlertRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeAlertPresentationResult =
  | { ok: true; value: AlertPresentation; errors: [] }
  | { ok: false; errors: AlertRuntimeValidationError[] };

export function validateRuntimeAlertPresentation(input: unknown): ValidateRuntimeAlertPresentationResult {
  const parsed = AlertPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeAlertPresentation(input: unknown): AlertPresentation {
  return AlertPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): AlertRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
