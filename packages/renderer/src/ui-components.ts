import type * as React from 'react';

// ---------------------------------------------------------------------------
// Shared primitive prop types
// ---------------------------------------------------------------------------

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

export interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
  rows?: number;
}

// ---------------------------------------------------------------------------
// InfoBadge
// ---------------------------------------------------------------------------

export type InfoBadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info';

export interface InfoBadgeProps {
  variant?: InfoBadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// DataGrid
// ---------------------------------------------------------------------------

export interface ColumnDef<TRow = Record<string, unknown>> {
  key: string;
  header: string;
  render: (row: TRow) => React.ReactNode;
  /** When defined the column is sortable; value is the sort key passed to onSort */
  sortKey?: string;
}

export interface DataGridProps<TRow = Record<string, unknown>> {
  columns: ColumnDef<TRow>[];
  rows: TRow[];
  isLoading?: boolean;
  /** Current sort as "<key>_<direction>", e.g. "name_asc". Empty string means unsorted. */
  sort?: string;
  onSort?: (sort: string) => void;
  getRowId?: (row: TRow) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// AlertDialog family
// ---------------------------------------------------------------------------

export interface AlertDialogProps {
  children?: React.ReactNode;
}

export interface AlertDialogTriggerProps {
  asChild?: boolean;
  children?: React.ReactNode;
}

export interface AlertDialogContentProps {
  children?: React.ReactNode;
}

export interface AlertDialogHeaderProps {
  children?: React.ReactNode;
}

export interface AlertDialogFooterProps {
  children?: React.ReactNode;
}

export interface AlertDialogTitleProps {
  children?: React.ReactNode;
}

export interface AlertDialogDescriptionProps {
  children?: React.ReactNode;
}

export interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// ListPageLayout
// ---------------------------------------------------------------------------

export interface ListPageLayoutProps {
  title?: string;
  actions?: React.ReactNode;
  filterStart?: React.ReactNode;
  filterEnd?: React.ReactNode;
  pagination?: React.ReactNode;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// SearchInput
// ---------------------------------------------------------------------------

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// PaginationControls
// ---------------------------------------------------------------------------

export interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

export interface ToastAPI {
  success: (message: string) => void;
  error: (message: string) => void;
  info?: (message: string) => void;
  warning?: (message: string) => void;
}

// ---------------------------------------------------------------------------
// UIComponents — the top-level interface injected via context
// ---------------------------------------------------------------------------

export interface UIComponents {
  /** Simple label element */
  Label: React.ComponentType<LabelProps>;

  /** Text input */
  TextInput: React.ForwardRefExoticComponent<TextInputProps & React.RefAttributes<HTMLInputElement>>;

  /** Number input */
  NumberInput: React.ForwardRefExoticComponent<NumberInputProps & React.RefAttributes<HTMLInputElement>>;

  /** Textarea */
  Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;

  /** Badge / pill used for enum values and status indicators */
  InfoBadge: React.ComponentType<InfoBadgeProps>;

  /** Data table */
  DataGrid: React.ComponentType<DataGridProps>;

  /** Compound alert-dialog (confirmation dialog) */
  AlertDialog: React.ComponentType<AlertDialogProps>;
  AlertDialogTrigger: React.ComponentType<AlertDialogTriggerProps>;
  AlertDialogContent: React.ComponentType<AlertDialogContentProps>;
  AlertDialogHeader: React.ComponentType<AlertDialogHeaderProps>;
  AlertDialogFooter: React.ComponentType<AlertDialogFooterProps>;
  AlertDialogTitle: React.ComponentType<AlertDialogTitleProps>;
  AlertDialogDescription: React.ComponentType<AlertDialogDescriptionProps>;
  AlertDialogAction: React.ComponentType<AlertDialogActionProps>;
  AlertDialogCancel: React.ComponentType<AlertDialogCancelProps>;

  /** Page-level list layout with title, action bar, filters and pagination slot */
  ListPageLayout: React.ComponentType<ListPageLayoutProps>;

  /** Search text input */
  SearchInput: React.ComponentType<SearchInputProps>;

  /** Pagination bar */
  PaginationControls: React.ComponentType<PaginationControlsProps>;

  /** Toast notification API */
  toast: ToastAPI;
}
