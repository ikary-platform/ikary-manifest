import type { PresentationValidationError } from '../types';
import type { DataGridPresentation } from '../../contract/data-grid/DataGridPresentationSchema';

export function validateDataGridPresentation(presentation: DataGridPresentation): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  // 1. Column keys must be unique
  const columnKeys = presentation.columns.map((column) => column.key);
  const duplicateColumnKeys = columnKeys.filter((key, index) => columnKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateColumnKeys)) {
    errors.push({
      path: 'columns',
      message: `Duplicate column key "${key}"`,
      code: 'DUPLICATE_COLUMN_KEY',
    });
  }

  // 2. At least one visible column must exist
  const visibleColumns = presentation.columns.filter((column) => !column.hidden);
  if (visibleColumns.length === 0) {
    errors.push({
      path: 'columns',
      message: 'At least one visible column is required',
      code: 'NO_VISIBLE_COLUMNS',
    });
  }

  // 3. At least one visible link column must exist
  // This matches your DataGrid rule that row click must not be the only navigation mechanism.
  const visibleLinkColumns = visibleColumns.filter((column) => column.type === 'link');
  if (visibleLinkColumns.length === 0) {
    errors.push({
      path: 'columns',
      message: 'At least one visible link column is required for explicit entity navigation',
      code: 'MISSING_VISIBLE_LINK_COLUMN',
    });
  }

  // 4. At most one actions column is allowed
  const actionColumns = visibleColumns.filter((column) => column.type === 'actions');
  if (actionColumns.length > 1) {
    errors.push({
      path: 'columns',
      message: 'Only one actions column is allowed',
      code: 'MULTIPLE_ACTIONS_COLUMNS',
    });
  }

  // 5. If an actions column exists, rowActions must exist
  if (actionColumns.length === 1 && (!presentation.rowActions || presentation.rowActions.length === 0)) {
    errors.push({
      path: 'rowActions',
      message: 'rowActions are required when an actions column is defined',
      code: 'MISSING_ROW_ACTIONS',
    });
  }

  // 6. Row action keys must be unique
  const rowActionKeys = (presentation.rowActions ?? []).map((action) => action.key);
  const duplicateRowActionKeys = rowActionKeys.filter((key, index) => rowActionKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateRowActionKeys)) {
    errors.push({
      path: 'rowActions',
      message: `Duplicate row action key "${key}"`,
      code: 'DUPLICATE_ROW_ACTION_KEY',
    });
  }

  // 7. V1 sorting mode must remain single-column only
  if (presentation.sorting?.enabled && presentation.sorting.mode !== 'single') {
    errors.push({
      path: 'sorting.mode',
      message: 'Only single-column sorting is allowed in V1',
      code: 'UNSUPPORTED_SORTING_MODE',
    });
  }

  // 8. V1 selection mode must remain page-scoped only
  if (presentation.selection?.enabled && presentation.selection.mode !== 'page') {
    errors.push({
      path: 'selection.mode',
      message: 'Only page selection is allowed in V1',
      code: 'UNSUPPORTED_SELECTION_MODE',
    });
  }

  return errors;
}
