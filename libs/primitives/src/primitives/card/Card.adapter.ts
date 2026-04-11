import type { CardPresentation } from '@ikary/presentation';
import type { CardViewProps } from './Card.types';

export type BuildCardViewModelInput = {
  presentation: CardPresentation;
};

export function buildCardViewModel(input: BuildCardViewModelInput): CardViewProps {
  return {
    title: normalizeOptionalText(input.presentation.title),
    description: normalizeOptionalText(input.presentation.description),
    content: normalizeOptionalText(input.presentation.content),
    footer: normalizeOptionalText(input.presentation.footer),
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
