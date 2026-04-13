import type { ReactNode } from 'react';

export type CardListLayoutColumns = '1' | '2' | '3';

export type CardListActionIntent = 'default' | 'neutral' | 'danger';

export type CardListBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type CardListValueType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'badge'
  | 'status'
  | 'enum'
  | 'link';

export type CardListResolvedAction = {
  key: string;
  label: string;
  icon?: string;
  intent?: CardListActionIntent;
  href?: string;
  disabled?: boolean;
  hidden?: boolean;
  onClick?: () => void;
};

export type CardListResolvedField = {
  key: string;
  label: string;
  value: ReactNode;
  valueType?: CardListValueType;
  empty?: boolean;
};

export type CardListResolvedMetric = {
  key: string;
  label: string;
  value: ReactNode;
  supportingText?: string;
};

export type CardListResolvedBadge = {
  value: ReactNode;
  tone?: CardListBadgeTone;
};

export type CardListResolvedEmptyState = {
  title: string;
  description?: string;
};

export type CardListResolvedCard<TRecord = Record<string, unknown>> = {
  key: string;
  record: TRecord;

  title: ReactNode;
  subtitle?: ReactNode;

  badge?: CardListResolvedBadge;

  fields?: CardListResolvedField[];
  metrics?: CardListResolvedMetric[];

  actions?: CardListResolvedAction[];
};

export type CardListViewProps<TRecord = Record<string, unknown>> = {
  items: CardListResolvedCard<TRecord>[];

  columns?: CardListLayoutColumns;

  emptyState?: CardListResolvedEmptyState;

  dense?: boolean;
  loading?: boolean;
};
