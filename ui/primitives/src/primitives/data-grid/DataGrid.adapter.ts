import type { ReactNode } from 'react';
import type { DataGridPresentation } from '@ikary/presentation';
import type { DataGridViewColumn, DataGridViewProps, DataGridViewSort } from './DataGrid.types';
import {
  buildEmptyState,
  defaultAlign,
  getValue,
  renderActionsCell,
  renderDataGridFieldValueCell,
  type DataGridFormatters,
} from './DataGrid.cells';

type PresentationColumn = DataGridPresentation['columns'][number];

export type BuildDataGridViewModelInput<T> = {
  presentation: DataGridPresentation;
  rows: T[];
  getRowId: (row: T, index: number) => string;

  loading?: boolean;

  sort?: DataGridViewSort;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;

  selectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;

  onRowOpen?: (row: T) => void;

  /**
   * Optional href resolver for explicit link cells.
   * If omitted, link cells fall back to onRowOpen when available.
   */
  getRowHref?: (row: T, column: PresentationColumn) => string | undefined;

  /**
   * Runtime action handlers keyed by actionKey from the presentation contract.
   */
  actionHandlers?: Record<string, (row: T) => void>;

  /**
   * Optional renderers for "custom" columns, keyed by column.key.
   */
  customRenderers?: Record<string, (row: T) => ReactNode>;

  /**
   * Deprecated: value formatting now flows through the shared FieldValue primitive.
   * Kept for compatibility with existing resolver runtime inputs.
   */
  formatters?: DataGridFormatters;

  /**
   * Error surface still belongs to List Page.
   */
  errorState?: ReactNode;
};

export function buildDataGridViewModel<T>(input: BuildDataGridViewModelInput<T>): DataGridViewProps<T> {
  const columns: DataGridViewColumn<T>[] = input.presentation.columns.map((column) => buildViewColumn(column, input));

  return {
    rows: input.rows ?? [],
    columns,
    getRowId: input.getRowId,
    loading: input.loading,
    selectable: input.presentation.selection?.enabled === true,
    selectedRowIds: input.selectedRowIds ?? [],
    onSelectionChange: input.onSelectionChange,
    sort: input.sort,
    onSortChange: input.onSortChange,
    onRowOpen: input.onRowOpen,
    emptyState: buildEmptyState(input.presentation.emptyState),
    errorState: input.errorState,
    dense: input.presentation.dense,
    stickyHeader: input.presentation.stickyHeader,
  };
}

function buildViewColumn<T>(column: PresentationColumn, input: BuildDataGridViewModelInput<T>): DataGridViewColumn<T> {
  return {
    key: column.key,
    label: column.label,
    sortable: column.sortable,
    sortField: column.sortField ?? column.field ?? column.key,
    align: column.align ?? defaultAlign(column),
    minWidth: column.minWidth,
    width: column.width,
    hidden: column.hidden,
    renderCell: (row: T) => renderColumnCell(column, row, input),
  };
}

function renderColumnCell<T>(column: PresentationColumn, row: T, input: BuildDataGridViewModelInput<T>): ReactNode {
  if (column.type === 'actions') {
    const actions = (input.presentation.rowActions ?? []).map((action) => ({
      key: action.key,
      label: action.label,
      intent: action.intent,
      requiresConfirmation: action.requiresConfirmation,
      onClick: input.actionHandlers?.[action.actionKey],
    }));

    return renderActionsCell({
      row,
      actions,
    });
  }

  if (column.type === 'custom') {
    const customRenderer = input.customRenderers?.[column.key];
    if (customRenderer) {
      return customRenderer(row);
    }

    const fallbackValue = column.field ? getValue(row, column.field) : undefined;
    return renderDataGridFieldValueCell({
      column,
      row,
      value: fallbackValue,
      dense: input.presentation.dense,
    });
  }

  const raw = column.field ? getValue(row, column.field) : undefined;

  return renderDataGridFieldValueCell({
    column,
    row,
    value: raw,
    href: input.getRowHref?.(row, column),
    onOpen: input.onRowOpen,
    dense: input.presentation.dense,
  });
}
