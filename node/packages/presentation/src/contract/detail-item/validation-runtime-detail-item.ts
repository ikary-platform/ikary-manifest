import type { ZodIssue } from 'zod';
import { DetailItemSchema, type DetailItem } from './DetailItemSchema';

export type DetailItemRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeDetailItemResult =
  | {
      ok: true;
      value: DetailItem;
      errors: [];
    }
  | {
      ok: false;
      errors: DetailItemRuntimeValidationError[];
    };

export function validateRuntimeDetailItem(input: unknown): ValidateRuntimeDetailItemResult {
  const parsed = DetailItemSchema.safeParse(input);

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

export function parseRuntimeDetailItem(input: unknown): DetailItem {
  return DetailItemSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): DetailItemRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
