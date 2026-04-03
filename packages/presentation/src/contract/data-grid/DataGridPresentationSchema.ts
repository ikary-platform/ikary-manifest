import { z } from 'zod';
import { DataGridColumnSchema } from './DataGridColumnSchema';
import { DataGridRowActionSchema } from './DataGridRowActionSchema';

const EmptyStateSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
  })
  .strict();

const DataGridSelectionSchema = z
  .object({
    enabled: z.boolean(),
    mode: z.enum(['page']).default('page'),
  })
  .strict();

const DataGridSortingSchema = z
  .object({
    enabled: z.boolean(),
    mode: z.enum(['single']).default('single'),
  })
  .strict();

const DataGridPaginationSchema = z
  .object({
    enabled: z.boolean(),
    pageSizeOptions: z.array(z.number().int().positive()).min(1).optional(),
    showTotalCount: z.boolean().optional(),
  })
  .strict();

export const DataGridPresentationSchema = z
  .object({
    type: z.literal('data-grid'),

    columns: z.array(DataGridColumnSchema).min(1),

    selection: DataGridSelectionSchema.optional(),
    sorting: DataGridSortingSchema.optional(),
    pagination: DataGridPaginationSchema.optional(),

    rowActions: z.array(DataGridRowActionSchema).optional(),

    emptyState: EmptyStateSchema.optional(),

    /**
     * Optional surface hints only.
     */
    dense: z.boolean().optional(),
    stickyHeader: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const columnKeys = value.columns.map((c) => c.key);
    const duplicateColumnKeys = columnKeys.filter((k, i) => columnKeys.indexOf(k) !== i);

    for (const key of new Set(duplicateColumnKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['columns'],
        message: `duplicate column key "${key}"`,
      });
    }

    const visibleColumns = value.columns.filter((c) => !c.hidden);
    if (visibleColumns.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['columns'],
        message: 'at least one visible column is required',
      });
    }

    const rowActionKeys = (value.rowActions ?? []).map((a) => a.key);
    const duplicateActionKeys = rowActionKeys.filter((k, i) => rowActionKeys.indexOf(k) !== i);

    for (const key of new Set(duplicateActionKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rowActions'],
        message: `duplicate row action key "${key}"`,
      });
    }

    const actionColumns = value.columns.filter((c) => c.type === 'actions');
    if (actionColumns.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['columns'],
        message: 'only one actions column is allowed',
      });
    }

    if (actionColumns.length === 1 && (!value.rowActions || value.rowActions.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rowActions'],
        message: 'rowActions are required when an actions column is defined',
      });
    }

    const linkColumns = value.columns.filter((c) => c.type === 'link' && !c.hidden);
    if (linkColumns.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['columns'],
        message: 'at least one visible link column is required for explicit entity navigation',
      });
    }

    if (value.sorting?.mode && value.sorting.mode !== 'single') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sorting', 'mode'],
        message: 'only single-column sorting is allowed in V1',
      });
    }

    if (value.selection?.mode && value.selection.mode !== 'page') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['selection', 'mode'],
        message: 'only page selection is allowed in V1',
      });
    }
  });

export type DataGridPresentation = z.infer<typeof DataGridPresentationSchema>;
