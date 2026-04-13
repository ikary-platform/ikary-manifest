import type { SelectPresentation } from '@ikary/cell-presentation';
import type { SelectOptionView, SelectViewProps } from './Select.types';

export type BuildSelectViewModelInput = {
  presentation: SelectPresentation;
  value?: string;
  describedBy?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};

export function buildSelectViewModel(input: BuildSelectViewModelInput): SelectViewProps {
  return {
    value: input.value ?? input.presentation.value,
    defaultValue: input.presentation.defaultValue,
    placeholder: normalizeOptionalText(input.presentation.placeholder),
    disabled: input.presentation.disabled ?? false,
    required: input.presentation.required ?? false,
    invalid: input.presentation.invalid ?? false,
    loading: input.presentation.loading ?? false,
    name: normalizeOptionalText(input.presentation.name),
    id: normalizeOptionalText(input.presentation.id),
    options: input.presentation.options.map(mapOption),
    emptyMessage: normalizeOptionalText(input.presentation.emptyMessage) ?? 'No options available',
    leadingIcon: normalizeOptionalText(input.presentation.leadingIcon),
    describedBy: input.describedBy,
    onValueChange: input.onValueChange,
    onBlur: input.onBlur,
  };
}

function mapOption(option: {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: string;
}): SelectOptionView {
  return {
    value: option.value,
    label: option.label,
    disabled: option.disabled,
    description: option.description,
    icon: option.icon,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
