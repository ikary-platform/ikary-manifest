import type { ProgressPresentation } from '@ikary/cell-presentation';
import type { ProgressViewProps } from './Progress.types';

export type BuildProgressViewModelInput = {
  presentation: ProgressPresentation;
};

export function buildProgressViewModel(input: BuildProgressViewModelInput): ProgressViewProps {
  return {
    value: input.presentation.value,
    label: normalizeOptionalText(input.presentation.label),
    showValue: input.presentation.showValue,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
