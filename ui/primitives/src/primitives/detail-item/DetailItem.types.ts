import type { FieldValueTone, FieldValueViewProps } from '../field-value/FieldValue.types';

export type DetailItemKind =
  | 'text'
  | 'long-text'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'status'
  | 'badge-list'
  | 'link'
  | 'user-reference'
  | 'entity-reference'
  | 'list-summary';

export type DetailItemFieldValueKind = 'text' | 'long-text' | 'date' | 'datetime' | 'boolean' | 'status' | 'link';

type DetailItemBaseViewProps = {
  key: string;
  label: string;
  kind: DetailItemKind;
  dense: boolean;
  loading: boolean;
  errorLabel?: string;
  testId?: string;
  labelId: string;
  valueId: string;
};

export type DetailItemFieldValueViewProps = DetailItemBaseViewProps & {
  kind: DetailItemFieldValueKind;
  valueView: FieldValueViewProps;
};

export type DetailItemBadgeView = {
  key: string;
  label: string;
  tone?: FieldValueTone;
};

export type DetailItemBadgeListViewProps = DetailItemBaseViewProps & {
  kind: 'badge-list';
  badges: DetailItemBadgeView[];
  overflowCount: number;
  emptyLabel: string;
};

export type DetailItemReferenceView = {
  label: string;
  secondaryLabel?: string;
  href?: string;
};

export type DetailItemReferenceViewProps = DetailItemBaseViewProps & {
  kind: 'user-reference' | 'entity-reference';
  reference?: DetailItemReferenceView;
  emptyLabel: string;
};

export type DetailItemListSummaryViewProps = DetailItemBaseViewProps & {
  kind: 'list-summary';
  items: string[];
  maxVisible: number;
  overflowCount: number;
  emptyLabel: string;
};

export type DetailItemViewProps =
  | DetailItemFieldValueViewProps
  | DetailItemBadgeListViewProps
  | DetailItemReferenceViewProps
  | DetailItemListSummaryViewProps;
