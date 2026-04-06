import type { ReactNode } from 'react';

export type DataGridViewSortDirection = 'asc' | 'desc';

export type DataGridViewColumnAlign = 'start' | 'center' | 'end';
export type DataGridColumnAlign = DataGridViewColumnAlign | 'left' | 'right';

export type DataGridViewColumnWidth = number | 'auto' | 'content';
export type DataGridColumnWidth = DataGridViewColumnWidth;

export type DataGridColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'status'
  | 'badge'
  | 'link'
  | 'enum'
  | 'currency'
  | 'custom'
  | 'actions';

export type DataGridColumn<T> = {
  key: string;
  label: string;
  type?: DataGridColumnType;
  sortable?: boolean;
  sortField?: string;
  align?: DataGridColumnAlign;
  minWidth?: number;
  width?: DataGridColumnWidth;
  hidden?: boolean;
  renderCell?: (row: T) => ReactNode;
  cell?: (row: T) => unknown;
};

export type DataGridViewColumn<T> = DataGridColumn<T>;

export type DataGridSortState = {
  field?: string;
  direction?: DataGridViewSortDirection;
};

export type DataGridViewSort = DataGridSortState;

export type DataGridPaginationState = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export type DataGridProps<T> = {
  rows: T[];
  columns: DataGridColumn<T>[];
  getRowId?: (row: T, index: number) => string;

  loading?: boolean;

  selectable?: boolean;
  selectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;

  sort?: DataGridSortState;
  onSortChange?: (field: string, direction: DataGridViewSortDirection) => void;

  pagination?: DataGridPaginationState;

  onRowOpen?: (row: T) => void;

  rowActions?: (row: T) => ReactNode;

  emptyState?: ReactNode;
  errorState?: ReactNode;

  dense?: boolean;
  stickyHeader?: boolean;
};

export type DataGridViewProps<T> = Omit<DataGridProps<T>, 'getRowId'> & {
  getRowId: (row: T, index: number) => string;
};
