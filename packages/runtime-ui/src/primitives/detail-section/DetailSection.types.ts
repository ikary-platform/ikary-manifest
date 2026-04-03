import type { ReactNode } from 'react';

export type DetailSectionActionIntent = 'default' | 'neutral' | 'danger';

export type DetailSectionMetaTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type DetailSectionEmphasis = 'default' | 'subtle' | 'strong';

export type DetailSectionValueType =
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

export type DetailSectionResolvedAction = {
  key: string;
  label: string;
  icon?: string;
  intent?: DetailSectionActionIntent;
  href?: string;
  disabled?: boolean;
  hidden?: boolean;
  onClick?: () => void;
};

export type DetailSectionResolvedFieldItem = {
  key: string;
  label: string;
  value: ReactNode;
  valueType?: DetailSectionValueType;
  icon?: string;
  tooltip?: string;
  empty?: boolean;
};

export type DetailSectionResolvedMetricItem = {
  key: string;
  label: string;
  value: ReactNode;
  supportingText?: string;
};

export type DetailSectionResolvedCallout = {
  tone: DetailSectionMetaTone;
  title: string;
  description?: string;
};

export type DetailSectionResolvedEmptyState = {
  title: string;
  description?: string;
};

export type DetailSectionFieldListView = {
  mode: 'field-list';
  items: DetailSectionResolvedFieldItem[];
  emptyState?: DetailSectionResolvedEmptyState;
};

export type DetailSectionFieldGridView = {
  mode: 'field-grid';
  columns?: 2 | 3;
  items: DetailSectionResolvedFieldItem[];
  emptyState?: DetailSectionResolvedEmptyState;
};

export type DetailSectionMetricListView = {
  mode: 'metric-list';
  items: DetailSectionResolvedMetricItem[];
  emptyState?: DetailSectionResolvedEmptyState;
};

export type DetailSectionCalloutView = {
  mode: 'callout';
  callout: DetailSectionResolvedCallout;
};

export type DetailSectionCustomBlockView = {
  mode: 'custom-block';
  content?: ReactNode;
  emptyState?: DetailSectionResolvedEmptyState;
};

export type DetailSectionViewContent =
  | DetailSectionFieldListView
  | DetailSectionFieldGridView
  | DetailSectionMetricListView
  | DetailSectionCalloutView
  | DetailSectionCustomBlockView;

export type DetailSectionViewProps = {
  title: string;
  description?: string;
  actions?: DetailSectionResolvedAction[];
  content: DetailSectionViewContent;
  emphasis?: DetailSectionEmphasis;
  dense?: boolean;
};
