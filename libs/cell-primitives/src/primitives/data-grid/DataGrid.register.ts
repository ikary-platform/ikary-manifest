import type { DataGridPresentation } from '@ikary/cell-presentation';
import { registerPrimitive } from '../../registry/primitiveRegistry';
import { DataGrid } from './DataGrid';
import { resolveDataGrid } from './DataGrid.resolver';

registerPrimitive('data-grid', {
  component: DataGrid,
  resolver: (props, context) =>
    resolveDataGrid(props as DataGridPresentation, context as Parameters<typeof resolveDataGrid>[1]),
});
