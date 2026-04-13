import type { ZodIssue } from 'zod';
import { BadgePresentationSchema, type BadgePresentation } from './BadgePresentationSchema';

export type BadgeRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeBadgePresentationResult =
  | { ok: true; value: BadgePresentation; errors: [] }
  | { ok: false; errors: BadgeRuntimeValidationError[] };

export function validateRuntimeBadgePresentation(input: unknown): ValidateRuntimeBadgePresentationResult {
  const parsed = BadgePresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeBadgePresentation(input: unknown): BadgePresentation {
  return BadgePresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): BadgeRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
