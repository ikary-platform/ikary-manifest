import type { ZodIssue } from 'zod';
import { ActivityFeedPresentationSchema, type ActivityFeedPresentation } from './ActivityFeedPresentationSchema';

export type ActivityFeedRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeActivityFeedPresentationResult =
  | {
      ok: true;
      value: ActivityFeedPresentation;
      errors: [];
    }
  | {
      ok: false;
      errors: ActivityFeedRuntimeValidationError[];
    };

export function validateRuntimeActivityFeedPresentation(input: unknown): ValidateRuntimeActivityFeedPresentationResult {
  const parsed = ActivityFeedPresentationSchema.safeParse(input);

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

export function parseRuntimeActivityFeedPresentation(input: unknown): ActivityFeedPresentation {
  return ActivityFeedPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): ActivityFeedRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
