import { z } from 'zod';

export const BulkCommandBarVariantSchema = z.enum(['list', 'section']);

export const BulkCommandBarDensitySchema = z.enum(['comfortable', 'compact']);

export const BulkCommandBarScopeSchema = z.enum(['page', 'all-results']);

export const BulkCommandBarActionVariantSchema = z.enum(['default', 'secondary', 'destructive']);

export const BulkCommandBarConfirmSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    confirmLabel: z.string().min(1).optional(),
    cancelLabel: z.string().min(1).optional(),
  })
  .strict();

export const BulkCommandBarActionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    icon: z.string().min(1).optional(),
    variant: BulkCommandBarActionVariantSchema.optional(),
    disabled: z.boolean().optional(),
    loading: z.boolean().optional(),
    confirm: BulkCommandBarConfirmSchema.optional(),
  })
  .strict();

export const BulkCommandBarClearSelectionActionSchema = z
  .object({
    label: z.string().min(1),
    actionKey: z.string().min(1).optional(),
  })
  .strict();

export const BulkCommandBarSelectAllResultsActionSchema = z
  .object({
    label: z.string().min(1),
    actionKey: z.string().min(1).optional(),
  })
  .strict();

export const BulkCommandBarPresentationSchema = z
  .object({
    variant: BulkCommandBarVariantSchema.optional(),
    density: BulkCommandBarDensitySchema.optional(),

    selectedCount: z.number().int().min(0),
    scope: BulkCommandBarScopeSchema.optional(),

    summaryLabel: z.string().min(1).optional(),

    actions: z.array(BulkCommandBarActionSchema),
    overflowActions: z.array(BulkCommandBarActionSchema).optional(),

    clearSelectionAction: BulkCommandBarClearSelectionActionSchema.optional(),
    selectAllResultsAction: BulkCommandBarSelectAllResultsActionSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const allActionKeys = [
      ...value.actions.map((action) => action.key),
      ...(value.overflowActions ?? []).map((action) => action.key),
    ];

    const duplicateActionKeys = allActionKeys.filter((key, index) => allActionKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateActionKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actions'],
        message: `duplicate action key "${key}"`,
      });
    }
  });

export type BulkCommandBarPresentation = z.infer<typeof BulkCommandBarPresentationSchema>;
export type BulkCommandBarAction = z.infer<typeof BulkCommandBarActionSchema>;
