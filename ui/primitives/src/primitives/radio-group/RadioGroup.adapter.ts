import type { RadioGroupPresentation } from '@ikary-manifest/presentation';
import type { RadioGroupOptionView, RadioGroupViewProps } from './RadioGroup.types';

export type BuildRadioGroupViewModelInput = {
  presentation: RadioGroupPresentation;
  value?: string;
  describedBy?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};

export function buildRadioGroupViewModel(input: BuildRadioGroupViewModelInput): RadioGroupViewProps {
  return {
    value: input.value ?? input.presentation.value,
    defaultValue: input.presentation.defaultValue,
    disabled: input.presentation.disabled ?? false,
    required: input.presentation.required ?? false,
    invalid: input.presentation.invalid ?? false,
    loading: input.presentation.loading ?? false,
    name: normalizeOptionalText(input.presentation.name),
    id: normalizeOptionalText(input.presentation.id),
    direction: input.presentation.direction ?? 'vertical',
    options: input.presentation.options.map(mapOption),
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
}): RadioGroupOptionView {
  return {
    value: option.value,
    label: option.label,
    disabled: option.disabled,
    description: option.description,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
