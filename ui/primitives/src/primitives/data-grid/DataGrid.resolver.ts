import type { DataGridPresentation } from '@ikary-manifest/presentation';
import { buildDataGridViewModel, type BuildDataGridViewModelInput } from './DataGrid.adapter';

export type DataGridResolverContext<T> = Omit<BuildDataGridViewModelInput<T>, 'presentation'>;

export function resolveDataGrid<T>(presentation: DataGridPresentation, context: DataGridResolverContext<T>) {
  return buildDataGridViewModel({
    presentation,
    ...context,
  });
}
