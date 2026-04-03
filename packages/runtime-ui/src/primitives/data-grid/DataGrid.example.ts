import { DataGridPresentationSchema, type DataGridPresentation } from '@ikary-manifest/presentation';

export const DATA_GRID_PRESENTATION_EXAMPLE: DataGridPresentation = DataGridPresentationSchema.parse({
  type: 'data-grid',
  columns: [
    {
      key: 'name',
      field: 'name',
      label: 'Name',
      type: 'link',
      sortable: true,
      sortField: 'name',
      minWidth: 220,
      linkTarget: { type: 'detail-page' },
    },
    {
      key: 'status',
      field: 'status',
      label: 'Status',
      type: 'badge',
      minWidth: 120,
    },
    {
      key: 'createdAt',
      field: 'createdAt',
      label: 'Created',
      type: 'date',
      sortable: true,
      sortField: 'createdAt',
      align: 'start',
      minWidth: 140,
      format: { dateStyle: 'medium' },
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'end',
      width: 'content',
    },
  ],
  sorting: {
    enabled: true,
    mode: 'single',
  },
  pagination: {
    enabled: true,
    pageSizeOptions: [10, 25, 50],
    showTotalCount: true,
  },
  rowActions: [
    { key: 'open', label: 'Open', actionKey: 'open' },
    { key: 'edit', label: 'Edit', actionKey: 'edit' },
    {
      key: 'delete',
      label: 'Delete',
      actionKey: 'delete',
      intent: 'danger',
      requiresConfirmation: true,
    },
  ],
  emptyState: {
    title: 'No records found',
    description: 'Try changing your filters or create a new record.',
  },
});

export const DATA_GRID_RUNTIME_EXAMPLE = {
  rows: [
    {
      id: 'rec-001',
      name: 'Acme Corporation',
      status: 'active',
      createdAt: '2026-02-10',
    },
    {
      id: 'rec-002',
      name: 'Globex Ltd',
      status: 'pending',
      createdAt: '2026-02-14',
    },
    {
      id: 'rec-003',
      name: 'Umbrella Systems',
      status: 'inactive',
      createdAt: '2026-02-21',
    },
  ],
  selectedRowIds: ['rec-002'],
  sort: {
    field: 'createdAt',
    direction: 'asc' as const,
  },
};
