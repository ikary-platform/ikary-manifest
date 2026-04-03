import { z } from 'zod';

export const DetailSectionActionIntentSchema = z.enum(['default', 'neutral', 'danger']);

export const DetailSectionValueTypeSchema = z.enum([
  'text',
  'number',
  'currency',
  'date',
  'datetime',
  'boolean',
  'badge',
  'status',
  'enum',
  'link',
]);

export const DetailSectionCalloutToneSchema = z.enum(['neutral', 'info', 'success', 'warning', 'danger']);

export const DetailSectionEmphasisSchema = z.enum(['default', 'subtle', 'strong']);

export const DetailSectionActionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    actionKey: z.string().min(1).optional(),
    href: z.string().min(1).optional(),
    intent: DetailSectionActionIntentSchema.optional(),
    icon: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
    hiddenWhenUnauthorized: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.actionKey && !value.href) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actionKey'],
        message: 'actionKey or href is required',
      });
    }

    if (value.actionKey && value.href) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['href'],
        message: 'actionKey and href cannot both be set at the same time',
      });
    }
  });

export const DetailSectionEmptyStateSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
  })
  .strict();

export const DetailSectionFieldItemSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),

    /**
     * Stable runtime field reference, e.g. "customer.name" or "owner.email"
     */
    field: z.string().min(1),

    valueType: DetailSectionValueTypeSchema.optional(),

    /**
     * Optional presentation hints
     */
    icon: z.string().min(1).optional(),
    tooltip: z.string().min(1).optional(),
    emptyLabel: z.string().min(1).optional(),
  })
  .strict();

export const DetailSectionMetricItemSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    field: z.string().min(1),
    valueType: z.enum(['number', 'currency', 'text']).optional(),
    supportingText: z.string().min(1).optional(),
  })
  .strict();

export const DetailSectionCalloutSchema = z
  .object({
    tone: DetailSectionCalloutToneSchema,
    title: z.string().min(1),
    description: z.string().min(1).optional(),
  })
  .strict();

export const DetailSectionFieldListContentSchema = z
  .object({
    mode: z.literal('field-list'),
    items: z.array(DetailSectionFieldItemSchema).min(1),
    emptyState: DetailSectionEmptyStateSchema.optional(),
  })
  .strict();

export const DetailSectionFieldGridContentSchema = z
  .object({
    mode: z.literal('field-grid'),
    columns: z.number().int().min(2).max(3).optional(),
    items: z.array(DetailSectionFieldItemSchema).min(1),
    emptyState: DetailSectionEmptyStateSchema.optional(),
  })
  .strict();

export const DetailSectionMetricListContentSchema = z
  .object({
    mode: z.literal('metric-list'),
    items: z.array(DetailSectionMetricItemSchema).min(1),
    emptyState: DetailSectionEmptyStateSchema.optional(),
  })
  .strict();

export const DetailSectionCalloutContentSchema = z
  .object({
    mode: z.literal('callout'),
    callout: DetailSectionCalloutSchema,
  })
  .strict();

export const DetailSectionCustomBlockContentSchema = z
  .object({
    mode: z.literal('custom-block'),

    /**
     * Stable runtime-resolved block reference.
     * The runtime decides what actual content is rendered.
     */
    blockKey: z.string().min(1),

    emptyState: DetailSectionEmptyStateSchema.optional(),
  })
  .strict();

export const DetailSectionContentSchema = z.discriminatedUnion('mode', [
  DetailSectionFieldListContentSchema,
  DetailSectionFieldGridContentSchema,
  DetailSectionMetricListContentSchema,
  DetailSectionCalloutContentSchema,
  DetailSectionCustomBlockContentSchema,
]);

export const DetailSectionPresentationSchema = z
  .object({
    type: z.literal('detail-section'),

    title: z.string().min(1),
    description: z.string().min(1).optional(),

    actions: z.array(DetailSectionActionSchema).optional(),

    content: DetailSectionContentSchema,

    emphasis: DetailSectionEmphasisSchema.optional(),
    dense: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const actionKeys = (value.actions ?? []).map((action) => action.key);
    const duplicateActionKeys = actionKeys.filter((key, index) => actionKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateActionKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actions'],
        message: `duplicate action key "${key}"`,
      });
    }

    if ((value.actions ?? []).length > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actions'],
        message: 'DetailSection should expose at most 2 visible section actions in V1',
      });
    }

    if (value.content.mode === 'field-list' || value.content.mode === 'field-grid') {
      const itemKeys = value.content.items.map((item) => item.key);
      const duplicateItemKeys = itemKeys.filter((key, index) => itemKeys.indexOf(key) !== index);

      for (const key of new Set(duplicateItemKeys)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'items'],
          message: `duplicate field item key "${key}"`,
        });
      }
    }

    if (value.content.mode === 'metric-list') {
      const itemKeys = value.content.items.map((item) => item.key);
      const duplicateItemKeys = itemKeys.filter((key, index) => itemKeys.indexOf(key) !== index);

      for (const key of new Set(duplicateItemKeys)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'items'],
          message: `duplicate metric item key "${key}"`,
        });
      }
    }

    if (
      value.content.mode === 'field-grid' &&
      value.content.columns !== undefined &&
      value.content.columns !== 2 &&
      value.content.columns !== 3
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content', 'columns'],
        message: 'field-grid supports only 2 or 3 columns in V1',
      });
    }
  });

export type DetailSectionPresentation = z.infer<typeof DetailSectionPresentationSchema>;
