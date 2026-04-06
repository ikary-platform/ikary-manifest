import type { TogglePresentation } from '@ikary-manifest/presentation';
import type { ToggleViewProps } from './Toggle.types';

export type BuildToggleViewModelInput = {
  presentation: TogglePresentation;
  checked?: boolean;
  describedBy?: string;
  onCheckedChange?: (checked: boolean) => void;
  onBlur?: () => void;
};

export function buildToggleViewModel(input: BuildToggleViewModelInput): ToggleViewProps {
  return {
    checked: input.checked ?? input.presentation.checked,
    defaultChecked: input.presentation.defaultChecked,
    disabled: input.presentation.disabled ?? false,
    required: input.presentation.required ?? false,
    invalid: input.presentation.invalid ?? false,
    loading: input.presentation.loading ?? false,
    name: normalizeOptionalText(input.presentation.name),
    id: normalizeOptionalText(input.presentation.id),
    label: normalizeOptionalText(input.presentation.label),
    describedBy: input.describedBy,
    onCheckedChange: input.onCheckedChange,
    onBlur: input.onBlur,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
