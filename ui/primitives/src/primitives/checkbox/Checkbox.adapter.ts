import type { CheckboxPresentation } from '@ikary/presentation';
import type { CheckboxViewProps } from './Checkbox.types';

export type BuildCheckboxViewModelInput = {
  presentation: CheckboxPresentation;
  checked?: boolean;
  describedBy?: string;
  onCheckedChange?: (checked: boolean) => void;
  onBlur?: () => void;
};

export function buildCheckboxViewModel(input: BuildCheckboxViewModelInput): CheckboxViewProps {
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
