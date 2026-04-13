import { z } from 'zod';

export const DataGridColumnTypeSchema = z.enum([
  'text',
  'number',
  'date',
  'datetime',
  'boolean',
  'status',
  'badge',
  'link',
  'enum',
  'currency',
  'custom',
  'actions',
]);

export const DataGridColumnAlignSchema = z.enum(['start', 'center', 'end']);

export const DataGridColumnWidthSchema = z.union([
  z.literal('auto'),
  z.literal('content'),
  z.number().int().positive(),
]);

export const DataGridColumnSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),

    /**
     * Stable field reference for standard cells.
     * Optional for actions/custom columns.
     */
    field: z.string().min(1).optional(),

    type: DataGridColumnTypeSchema,

    sortable: z.boolean().optional(),

    /**
     * Allows sorting on a different backend/runtime field than the visible column field.
     */
    sortField: z.string().min(1).optional(),

    align: DataGridColumnAlignSchema.optional(),

    minWidth: z.number().int().positive().optional(),
    width: DataGridColumnWidthSchema.optional(),

    hidden: z.boolean().optional(),

    /**
     * Presentation hints only.
     */
    truncate: z.boolean().optional(),
    tooltip: z.enum(['never', 'when-truncated', 'always']).optional(),

    /**
     * For explicit link columns only.
     * Keeps navigation declarative instead of JSX-driven.
     */
    linkTarget: z
      .object({
        type: z.enum(['detail-page']),
      })
      .strict()
      .optional(),

    /**
     * For currency/date formatting hints.
     * Keep small in V1.
     */
    format: z
      .object({
        currency: z.string().min(3).max(3).optional(),
        dateStyle: z.enum(['short', 'medium', 'long']).optional(),
        datetimeStyle: z.enum(['short', 'medium', 'long']).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const fieldRequiredTypes = new Set([
      'text',
      'number',
      'date',
      'datetime',
      'boolean',
      'status',
      'badge',
      'link',
      'enum',
      'currency',
    ]);

    if (fieldRequiredTypes.has(value.type) && !value.field) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['field'],
        message: `field is required for column type "${value.type}"`,
      });
    }

    if ((value.type === 'actions' || value.type === 'custom') && value.field) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['field'],
        message: `field must not be set for column type "${value.type}"`,
      });
    }

    if (value.type === 'link' && !value.linkTarget) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['linkTarget'],
        message: 'linkTarget is required for link columns',
      });
    }

    if (value.type !== 'link' && value.linkTarget) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['linkTarget'],
        message: 'linkTarget is only allowed for link columns',
      });
    }

    if (value.sortField && value.sortable !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sortField'],
        message: 'sortField requires sortable=true',
      });
    }
  });

export type DataGridColumn = z.infer<typeof DataGridColumnSchema>;
export type DataGridColumnType = z.infer<typeof DataGridColumnTypeSchema>;
