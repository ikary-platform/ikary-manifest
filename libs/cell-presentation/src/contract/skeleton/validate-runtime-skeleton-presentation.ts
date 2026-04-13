import type { ZodIssue } from 'zod';
import { SkeletonPresentationSchema, type SkeletonPresentation } from './SkeletonPresentationSchema';

export type SkeletonRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeSkeletonPresentationResult =
  | { ok: true; value: SkeletonPresentation; errors: [] }
  | { ok: false; errors: SkeletonRuntimeValidationError[] };

export function validateRuntimeSkeletonPresentation(input: unknown): ValidateRuntimeSkeletonPresentationResult {
  const parsed = SkeletonPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeSkeletonPresentation(input: unknown): SkeletonPresentation {
  return SkeletonPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): SkeletonRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
