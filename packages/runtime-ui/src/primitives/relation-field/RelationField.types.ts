import type { FormFieldViewProps } from '../form-field/FormField.types';

export type RelationFieldOption = { id: string; label: string };

type RelationFieldBase = {
  key: string;
  variant: 'relation';
  label: string;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  loading: boolean;
  dense: boolean;
  message?: { tone: 'error' | 'warning' | 'success'; text: string };
  fieldId: string;
  helpTextId?: string;
  messageId?: string;
  describedBy?: string;
};

export type RelationFieldAttachViewProps = RelationFieldBase & {
  mode: 'attach';
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchResults: RelationFieldOption[];
  isSearching: boolean;
  selectedOption: RelationFieldOption | null;
  onSelect: (opt: RelationFieldOption | null) => void;
  placeholder?: string;
};

export type RelationFieldCreateViewProps = RelationFieldBase & {
  mode: 'create';
  createFields: FormFieldViewProps[];
  createValues: Record<string, unknown>;
  onCreateValueChange: (key: string, value: unknown) => void;
};

export type RelationFieldCreateOrAttachViewProps = RelationFieldBase & {
  mode: 'create-or-attach';
  activeTab: 'create' | 'attach';
  onTabChange: (tab: 'create' | 'attach') => void;
  attachProps: Omit<RelationFieldAttachViewProps, keyof RelationFieldBase | 'mode'>;
  createProps: Omit<RelationFieldCreateViewProps, keyof RelationFieldBase | 'mode'>;
};

export type RelationFieldViewProps =
  | RelationFieldAttachViewProps
  | RelationFieldCreateViewProps
  | RelationFieldCreateOrAttachViewProps;

/**
 * Runtime data returned by useRelationRuntime.
 * Passed through FormSection.adapter fieldRuntime for relation fields.
 */
export type RelationFieldRuntime = {
  searchResults: RelationFieldOption[];
  isSearching: boolean;
  selectedOption: RelationFieldOption | null;
  searchValue: string;
  onSearchChange: (v: string) => void;
  onSelect: (opt: RelationFieldOption | null) => void;
  createFields: FormFieldViewProps[];
  createValues: Record<string, unknown>;
  onCreateValueChange: (key: string, val: unknown) => void;
  activeTab: 'create' | 'attach';
  onTabChange: (tab: 'create' | 'attach') => void;
  value: unknown;
  onValueChange: (v: unknown) => void;
};
