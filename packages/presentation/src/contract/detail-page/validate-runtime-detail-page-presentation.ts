import type { ZodIssue } from 'zod';
import { DetailPagePresentationSchema, type DetailPagePresentation } from './DetailPagePresentationSchema';

export type DetailPageRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeDetailPagePresentationResult =
  | {
      ok: true;
      value: DetailPagePresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: DetailPageRuntimeValidationError[];
    };

export function validateRuntimeDetailPagePresentation(input: unknown): ValidateRuntimeDetailPagePresentationResult {
  const parsed = DetailPagePresentationSchema.safeParse(input);

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

export function parseRuntimeDetailPagePresentation(input: unknown): DetailPagePresentation {
  return DetailPagePresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): DetailPageRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
