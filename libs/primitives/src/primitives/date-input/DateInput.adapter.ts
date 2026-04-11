import type { DateInputPresentation } from '@ikary/presentation';
import type { DateInputViewProps } from './DateInput.types';

export type BuildDateInputViewModelInput = {
  presentation: DateInputPresentation;
  value?: string;
  describedBy?: string;
  onValueChange?: (value: string | undefined) => void;
  onBlur?: () => void;
};

export function buildDateInputViewModel(input: BuildDateInputViewModelInput): DateInputViewProps {
  return {
    value: input.value ?? input.presentation.value,
    defaultValue: input.presentation.defaultValue,
    placeholder: normalizeOptionalText(input.presentation.placeholder),
    disabled: input.presentation.disabled ?? false,
    readonly: input.presentation.readonly ?? false,
    required: input.presentation.required ?? false,
    invalid: input.presentation.invalid ?? false,
    loading: input.presentation.loading ?? false,
    name: normalizeOptionalText(input.presentation.name),
    id: normalizeOptionalText(input.presentation.id),
    describedBy: input.describedBy,
    onValueChange: input.onValueChange,
    onBlur: input.onBlur,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
