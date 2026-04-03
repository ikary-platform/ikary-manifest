import type { ZodIssue } from 'zod';
import { TextareaPresentationSchema, type TextareaPresentation } from './TextareaPresentationSchema';

export type TextareaRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeTextareaPresentationResult =
  | {
      ok: true;
      value: TextareaPresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: TextareaRuntimeValidationError[];
    };

export function validateRuntimeTextareaPresentation(input: unknown): ValidateRuntimeTextareaPresentationResult {
  const parsed = TextareaPresentationSchema.safeParse(input);

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

export function parseRuntimeTextareaPresentation(input: unknown): TextareaPresentation {
  return TextareaPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): TextareaRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
