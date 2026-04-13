import type { AlertPresentation } from '@ikary/cell-presentation';
import type { AlertViewProps } from './Alert.types';

export type BuildAlertViewModelInput = {
  presentation: AlertPresentation;
};

export function buildAlertViewModel(input: BuildAlertViewModelInput): AlertViewProps {
  return {
    variant: input.presentation.variant,
    title: normalizeOptionalText(input.presentation.title),
    description: normalizeOptionalText(input.presentation.description),
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
