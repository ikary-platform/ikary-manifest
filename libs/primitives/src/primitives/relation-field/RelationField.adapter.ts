import type { FormFieldRelationPresentation } from '@ikary/presentation';
import type { FormFieldViewProps } from '../form-field/FormField.types';
import type { RelationFieldOption, RelationFieldViewProps } from './RelationField.types';

export type BuildRelationFieldViewModelInput = {
  presentation: FormFieldRelationPresentation;
  value?: unknown;
  onValueChange?: (v: unknown) => void;
  onBlur?: () => void;
  // Attach props
  searchResults?: RelationFieldOption[];
  isSearching?: boolean;
  selectedOption?: RelationFieldOption | null;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  onSelect?: (opt: RelationFieldOption | null) => void;
  // Create props
  createFields?: FormFieldViewProps[];
  createValues?: Record<string, unknown>;
  onCreateValueChange?: (key: string, val: unknown) => void;
  // Create-or-attach tab state
  activeTab?: 'create' | 'attach';
  onTabChange?: (tab: 'create' | 'attach') => void;
  // Section-level overrides
  disabled?: boolean;
  readonly?: boolean;
  dense?: boolean;
};

export function buildRelationFieldViewModel(input: BuildRelationFieldViewModelInput): RelationFieldViewProps {
  const { presentation } = input;
  const safeKey = presentation.key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');
  const fieldId = `form-field-${safeKey}`;
  const messageId = presentation.message ? `${fieldId}-message` : undefined;

  const base = {
    key: presentation.key,
    variant: 'relation' as const,
    label: presentation.label,
    required: presentation.required ?? false,
    disabled: input.disabled ?? presentation.disabled ?? false,
    readonly: input.readonly ?? presentation.readonly ?? false,
    loading: presentation.loading ?? false,
    dense: input.dense ?? presentation.dense ?? false,
    message: presentation.message,
    fieldId,
    messageId,
    describedBy: messageId,
  };

  const policy = presentation.createPolicy;

  if (policy === 'attach') {
    return {
      ...base,
      mode: 'attach',
      searchValue: input.searchValue ?? '',
      onSearchChange: input.onSearchChange ?? (() => undefined),
      searchResults: input.searchResults ?? [],
      isSearching: input.isSearching ?? false,
      selectedOption: input.selectedOption ?? null,
      onSelect: input.onSelect ?? (() => undefined),
      placeholder: presentation.placeholder,
    };
  }

  if (policy === 'create') {
    return {
      ...base,
      mode: 'create',
      createFields: input.createFields ?? [],
      createValues: input.createValues ?? {},
      onCreateValueChange: input.onCreateValueChange ?? (() => undefined),
    };
  }

  // create-or-attach
  return {
    ...base,
    mode: 'create-or-attach',
    activeTab: input.activeTab ?? 'attach',
    onTabChange: input.onTabChange ?? (() => undefined),
    attachProps: {
      searchValue: input.searchValue ?? '',
      onSearchChange: input.onSearchChange ?? (() => undefined),
      searchResults: input.searchResults ?? [],
      isSearching: input.isSearching ?? false,
      selectedOption: input.selectedOption ?? null,
      onSelect: input.onSelect ?? (() => undefined),
      placeholder: presentation.placeholder,
    },
    createProps: {
      createFields: input.createFields ?? [],
      createValues: input.createValues ?? {},
      onCreateValueChange: input.onCreateValueChange ?? (() => undefined),
    },
  };
}
