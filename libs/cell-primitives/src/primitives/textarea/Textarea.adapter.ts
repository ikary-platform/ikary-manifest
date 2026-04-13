import type { TextareaPresentation } from '@ikary/cell-presentation';
import type { TextareaViewProps } from './Textarea.types';

export type BuildTextareaViewModelInput = {
  presentation: TextareaPresentation;
  value?: string;
  describedBy?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};

export function buildTextareaViewModel(input: BuildTextareaViewModelInput): TextareaViewProps {
  return {
    value: input.value ?? input.presentation.value,
    defaultValue: input.presentation.defaultValue,
    placeholder: normalizeOptionalText(input.presentation.placeholder),
    rows: normalizeRows(input.presentation.rows),
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

function normalizeRows(rows: number | undefined): number | undefined {
  if (rows === undefined) return undefined;
  if (!Number.isFinite(rows)) return undefined;
  const normalized = Math.trunc(rows);
  return normalized > 0 ? normalized : undefined;
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
