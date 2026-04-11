import type { ZodIssue } from 'zod';
import { AvatarPresentationSchema, type AvatarPresentation } from './AvatarPresentationSchema';

export type AvatarRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeAvatarPresentationResult =
  | { ok: true; value: AvatarPresentation; errors: [] }
  | { ok: false; errors: AvatarRuntimeValidationError[] };

export function validateRuntimeAvatarPresentation(input: unknown): ValidateRuntimeAvatarPresentationResult {
  const parsed = AvatarPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeAvatarPresentation(input: unknown): AvatarPresentation {
  return AvatarPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): AvatarRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
