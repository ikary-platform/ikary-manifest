import type { FormFieldPresentation } from '@ikary/presentation';
import type { FormFieldOptionView, FormFieldViewProps } from './FormField.types';

export type BuildFormFieldViewModelInput = {
  presentation: FormFieldPresentation;

  /**
   * Runtime value for the field control.
   */
  value?: unknown;

  /**
   * Runtime change handler owned by the form/container layer.
   */
  onValueChange?: (value: unknown) => void;

  /**
   * Optional runtime blur handler.
   */
  onBlur?: () => void;
};

export function buildFormFieldViewModel(input: BuildFormFieldViewModelInput): FormFieldViewProps {
  const ids = resolveIds(input.presentation);

  const common = {
    key: input.presentation.key,
    helpText: input.presentation.helpText,
    smallTip: input.presentation.smallTip,
    message: input.presentation.message,
    required: input.presentation.required ?? false,
    readonly: input.presentation.readonly ?? false,
    disabled: input.presentation.disabled ?? false,
    loading: input.presentation.loading ?? false,
    dense: input.presentation.dense ?? false,
    testId: input.presentation.testId,
    fieldId: ids.fieldId,
    helpTextId: ids.helpTextId,
    smallTipId: ids.smallTipId,
    messageId: ids.messageId,
    describedBy: ids.describedBy,
    onBlur: input.onBlur,
  };

  if (input.presentation.variant === 'standard') {
    return {
      ...common,
      variant: 'standard',
      control: input.presentation.control,
      label: input.presentation.label,
      placeholder: input.presentation.placeholder,
      options: input.presentation.options?.map(mapOption),
      value: input.value,
      onValueChange: input.onValueChange,
    };
  }

  if (input.presentation.variant === 'checkbox') {
    return {
      ...common,
      variant: 'checkbox',
      label: input.presentation.label,
      checked: Boolean(input.value),
      onValueChange: (value: boolean) => input.onValueChange?.(value),
    };
  }

  if (input.presentation.variant === 'choice-group') {
    return {
      ...common,
      variant: 'choice-group',
      legend: input.presentation.legend,
      options: (input.presentation.options ?? []).map(mapOption),
      value: typeof input.value === 'string' ? input.value : undefined,
      onValueChange: (value: string) => input.onValueChange?.(value),
    };
  }

  throw new Error(
    `buildFormFieldViewModel: unsupported variant '${(input.presentation as { variant: string }).variant}'. Use buildRelationFieldViewModel for relation fields.`,
  );
}

function mapOption(option: {
  key: string;
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}): FormFieldOptionView {
  return {
    key: option.key,
    label: option.label,
    value: option.value,
    description: option.description,
    disabled: option.disabled,
  };
}

function resolveIds(presentation: FormFieldPresentation): {
  fieldId: string;
  helpTextId?: string;
  smallTipId?: string;
  messageId?: string;
  describedBy?: string;
} {
  const safeKey = presentation.key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');

  const fieldId = `form-field-${safeKey}`;

  const helpTextId = presentation.helpText ? `${fieldId}-help` : undefined;
  const smallTipId = presentation.smallTip ? `${fieldId}-tip` : undefined;
  const messageId = presentation.message ? `${fieldId}-message` : undefined;

  const describedBy = [helpTextId, smallTipId, messageId].filter((value): value is string => Boolean(value)).join(' ');

  return {
    fieldId,
    helpTextId,
    smallTipId,
    messageId,
    describedBy: describedBy.length > 0 ? describedBy : undefined,
  };
}
