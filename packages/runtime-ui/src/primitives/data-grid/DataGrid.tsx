import type { CSSProperties, ReactNode } from 'react';
import { RenderStateBoundary } from '../../runtime/RenderStateBoundary';
import type { RenderState } from '../../runtime/render-state.types';
import type { DataGridColumn, DataGridColumnAlign, DataGridProps, DataGridViewSortDirection } from './DataGrid.types';

function resolveColumnAlign<T>(column: DataGridColumn<T>): DataGridColumnAlign {
  return column.align ?? 'start';
}

function alignClass(align: DataGridColumnAlign): string {
  if (align === 'center') return 'text-center';
  if (align === 'end' || align === 'right') return 'text-right';
  return 'text-left';
}

function columnStyle<T>(column: DataGridColumn<T>): CSSProperties | undefined {
  const style: CSSProperties = {};

  if (column.minWidth) {
    style.minWidth = `${column.minWidth}px`;
  }

  if (typeof column.width === 'number') {
    style.width = `${column.width}px`;
  } else if (column.width === 'auto') {
    style.width = 'auto';
  } else if (column.width === 'content') {
    style.width = '1%';
    style.whiteSpace = 'nowrap';
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

function renderSortIndicator(active: boolean, direction?: DataGridViewSortDirection): string | null {
  if (!active) return null;
  return direction === 'desc' ? '▼' : '▲';
}

export function DataGrid<T>({
  rows,
  columns,
  getRowId,
  loading = false,
  selectable = false,
  selectedRowIds = [],
  onSelectionChange,
  sort,
  onSortChange,
  pagination,
  onRowOpen,
  rowActions,
  emptyState,
  errorState,
  dense = false,
  stickyHeader = false,
}: DataGridProps<T>) {
  const visibleColumns = columns.filter((column) => !column.hidden);
  const canSelect = selectable && typeof onSelectionChange === 'function';
  const hasRowActions = typeof rowActions === 'function';

  const resolveRowId =
    getRowId ??
    ((row: T, index: number) => {
      if (
        row != null &&
        typeof row === 'object' &&
        'id' in (row as object) &&
        (typeof (row as { id?: unknown }).id === 'string' || typeof (row as { id?: unknown }).id === 'number')
      ) {
        return String((row as { id?: string | number }).id);
      }

      return `row-${index + 1}`;
    });

  const rowIds = rows.map((row, index) => resolveRowId(row, index));
  const uniqueSelectedRowIds = Array.from(new Set(selectedRowIds));
  const allRowsSelected = rowIds.length > 0 && rowIds.every((id) => uniqueSelectedRowIds.includes(id));

  const bodyCellPadding = dense ? 'py-2' : 'py-2.5';
  const headerCellPadding = dense ? 'py-1.5' : 'py-2';
  const renderState = resolveDataGridRenderState({
    loading,
    rows,
    errorState,
    emptyState,
    dense,
  });

  function handleSort(column: DataGridColumn<T>) {
    if (!column.sortable || !onSortChange) return;

    const field = column.sortField ?? column.key;

    if (sort?.field !== field) {
      onSortChange(field, 'asc');
      return;
    }

    onSortChange(field, sort.direction === 'asc' ? 'desc' : 'asc');
  }

  return (
    <RenderStateBoundary state={renderState}>
      <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60">
                {canSelect && (
                  <th
                    className={`w-10 px-3 ${headerCellPadding} text-left ${
                      stickyHeader ? 'sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/60' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allRowsSelected}
                      onChange={(event) => {
                        onSelectionChange?.(event.target.checked ? rowIds : []);
                      }}
                      aria-label="Select all rows on page"
                    />
                  </th>
                )}

                {visibleColumns.map((column) => {
                  const align = resolveColumnAlign(column);
                  const sortField = column.sortField ?? column.key;
                  const active = sort?.field === sortField;
                  const ariaSort = active ? (sort?.direction === 'desc' ? 'descending' : 'ascending') : 'none';

                  return (
                    <th
                      key={column.key}
                      className={`${stickyHeader ? 'sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/60' : ''} px-4 ${headerCellPadding} ${alignClass(align)}`}
                      style={columnStyle(column)}
                      aria-sort={ariaSort}
                    >
                      {column.sortable && onSortChange ? (
                        <button
                          type="button"
                          onClick={() => handleSort(column)}
                          className={`inline-flex items-center gap-1 rounded-sm font-semibold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                            active
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                          }`}
                        >
                          {column.label}
                          {renderSortIndicator(active, sort?.direction)}
                        </button>
                      ) : (
                        <span className="font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          {column.label}
                        </span>
                      )}
                    </th>
                  );
                })}

                {hasRowActions && (
                  <th
                    className={`${stickyHeader ? 'sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/60' : ''} px-4 ${headerCellPadding} text-right`}
                  >
                    <span className="font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Actions
                    </span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => {
                const rowId = resolveRowId(row, index) || `row-${index}`;

                return (
                  <tr
                    key={rowId}
                    onClick={onRowOpen ? () => onRowOpen(row) : undefined}
                    className={`border-b border-gray-100 dark:border-gray-800 ${
                      onRowOpen ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40' : ''
                    }`}
                  >
                    {canSelect && (
                      <td className={`px-3 ${bodyCellPadding}`} onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={uniqueSelectedRowIds.includes(rowId)}
                          onChange={(event) => {
                            const checked = event.target.checked;

                            if (checked) {
                              onSelectionChange?.([...new Set([...uniqueSelectedRowIds, rowId])]);
                              return;
                            }

                            onSelectionChange?.(uniqueSelectedRowIds.filter((id) => id !== rowId));
                          }}
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    )}

                    {visibleColumns.map((column) => {
                      const align = resolveColumnAlign(column);

                      return (
                        <td
                          key={column.key}
                          className={`px-4 ${bodyCellPadding} text-gray-700 dark:text-gray-300 ${alignClass(align)}`}
                          style={columnStyle(column)}
                        >
                          {column.renderCell
                            ? column.renderCell(row)
                            : normalizeCellValue(
                                column.cell ? column.cell(row) : (row as Record<string, unknown>)[column.key],
                              )}
                        </td>
                      );
                    })}

                    {hasRowActions && (
                      <td className={`px-4 ${bodyCellPadding} text-right`} onClick={(event) => event.stopPropagation()}>
                        {rowActions?.(row)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-2 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
            <div>
              Page {pagination.page} of {Math.max(1, pagination.totalPages)} ({pagination.totalItems} total)
            </div>
            <div className="flex items-center gap-2">
              {pagination.onPageSizeChange && pagination.pageSizeOptions && (
                <select
                  value={pagination.pageSize}
                  onChange={(event) => pagination.onPageSizeChange?.(Number(event.target.value))}
                  className="h-7 rounded border border-gray-200 bg-white px-2 text-xs dark:border-gray-700 dark:bg-gray-900"
                >
                  {pagination.pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
                className="h-7 rounded border border-gray-200 px-2 disabled:opacity-40 dark:border-gray-700"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() =>
                  pagination.onPageChange(Math.min(Math.max(1, pagination.totalPages), pagination.page + 1))
                }
                disabled={pagination.page >= Math.max(1, pagination.totalPages)}
                className="h-7 rounded border border-gray-200 px-2 disabled:opacity-40 dark:border-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </RenderStateBoundary>
  );
}

function resolveDataGridRenderState<T>(input: {
  loading: boolean;
  rows: T[];
  errorState?: ReactNode;
  emptyState?: ReactNode;
  dense: boolean;
}): RenderState | undefined {
  if (input.errorState !== undefined && input.errorState !== null) {
    return toDataGridErrorState(input.errorState);
  }

  if (input.loading) {
    return {
      kind: 'loading',
      state: {
        variant: 'section',
        density: input.dense ? 'compact' : 'comfortable',
        mode: 'skeleton',
        label: 'Loading records',
      },
    };
  }

  if (input.rows.length === 0) {
    return {
      kind: 'empty',
      state: {
        title: toDataGridEmptyTitle(input.emptyState),
        variant: 'section',
        density: input.dense ? 'compact' : 'comfortable',
      },
    };
  }

  return undefined;
}

function toDataGridEmptyTitle(emptyState?: ReactNode): string {
  if (typeof emptyState === 'string' && emptyState.trim().length > 0) {
    return emptyState;
  }

  if (typeof emptyState === 'number') {
    return String(emptyState);
  }

  return 'No records to display.';
}

function toDataGridErrorState(errorState: ReactNode): RenderState {
  if (typeof errorState === 'string' && errorState.trim().length > 0) {
    return {
      kind: 'error',
      state: {
        title: errorState,
        variant: 'section',
        severity: 'soft',
      },
    };
  }

  if (typeof errorState === 'number') {
    return {
      kind: 'error',
      state: {
        title: String(errorState),
        variant: 'section',
        severity: 'soft',
      },
    };
  }

  return {
    kind: 'error',
    state: {
      title: 'Unable to load records',
      description: 'Please retry in a moment.',
      variant: 'section',
      severity: 'soft',
    },
  };
}

function normalizeCellValue(value: unknown): string | number {
  if (value == null || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export type {
  DataGridProps,
  DataGridColumn,
  DataGridColumnType,
  DataGridSortState,
  DataGridPaginationState,
} from './DataGrid.types';
