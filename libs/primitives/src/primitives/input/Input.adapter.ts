import type { InputPresentation } from '@ikary/presentation';
import type { InputViewProps } from './Input.types';

export type BuildInputViewModelInput = {
  presentation: InputPresentation;
  value?: InputPresentation['value'];
  describedBy?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};

const DEFAULT_INPUT_TYPE: InputViewProps['inputType'] = 'text';

export function buildInputViewModel(input: BuildInputViewModelInput): InputViewProps {
  return {
    inputType: input.presentation.inputType ?? DEFAULT_INPUT_TYPE,
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
    leadingIcon: normalizeOptionalText(input.presentation.leadingIcon),
    trailingIcon: normalizeOptionalText(input.presentation.trailingIcon),
    leadingText: normalizeOptionalText(input.presentation.leadingText),
    trailingText: normalizeOptionalText(input.presentation.trailingText),
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
