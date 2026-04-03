import type { ReactNode } from 'react';
import type { PageHeaderViewProps } from '../page-header';
import type { TabsViewProps } from '../tabs';
import type { DataGridViewProps } from '../data-grid';
import type { CardListViewProps } from '../card-list';
import type { PaginationViewProps } from '../pagination';

export type ListPageFilterItem = {
  key: string;
  label: string;
};

export type ListPageSearchView = {
  visible: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export type ListPageFiltersView = {
  visible: boolean;
  mode?: 'inline' | 'drawer';
  items: ListPageFilterItem[];
};

export type ListPageSortingView = {
  visible: boolean;
  mode?: 'summary' | 'controls';
  label?: string;
};

export type ListPageBulkAction = {
  key: string;
  label: string;
  intent?: 'default' | 'neutral' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
};

export type ListPageBulkUtilityAction = {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
};

export type ListPageBulkActionsView = {
  visible: boolean;
  selectedCount?: number;
  scope?: 'page' | 'all-results';
  summaryLabel?: string;
  actions: ListPageBulkAction[];
  overflowActions?: ListPageBulkAction[];
  clearSelectionAction?: ListPageBulkUtilityAction;
  selectAllResultsAction?: ListPageBulkUtilityAction;
};

export type ListPageControlsView = {
  search?: ListPageSearchView;
  filters?: ListPageFiltersView;
  sorting?: ListPageSortingView;
  bulkActions?: ListPageBulkActionsView;
};

export type ListPageEmptyStateView = {
  title: string;
  description?: string;
};

export type ListPageRendererView =
  | {
      mode: 'data-grid';
      props: DataGridViewProps<any>;
    }
  | {
      mode: 'card-list';
      props: CardListViewProps<any>;
    };

export type ListPageViewProps = {
  header?: PageHeaderViewProps;
  navigation?: TabsViewProps;
  controls?: ListPageControlsView;

  renderer: ListPageRendererView;

  pagination?: PaginationViewProps;
  emptyState?: ListPageEmptyStateView;

  loading?: boolean;
  errorState?: ReactNode;

  dense?: boolean;
};
