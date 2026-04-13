import type { ZodIssue } from 'zod';
import { CardPresentationSchema, type CardPresentation } from './CardPresentationSchema';

export type CardRuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntimeCardPresentationResult =
  | { ok: true; value: CardPresentation; errors: [] }
  | { ok: false; errors: CardRuntimeValidationError[] };

export function validateRuntimeCardPresentation(input: unknown): ValidateRuntimeCardPresentationResult {
  const parsed = CardPresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntimeCardPresentation(input: unknown): CardPresentation {
  return CardPresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): CardRuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
