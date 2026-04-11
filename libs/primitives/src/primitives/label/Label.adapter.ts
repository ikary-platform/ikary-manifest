import type { LabelPresentation } from '@ikary/presentation';
import type { LabelViewProps } from './Label.types';

export type BuildLabelViewModelInput = {
  presentation: LabelPresentation;
};

export function buildLabelViewModel(input: BuildLabelViewModelInput): LabelViewProps {
  return {
    text: input.presentation.text,
    htmlFor: normalizeOptionalText(input.presentation.htmlFor),
    required: input.presentation.required,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
