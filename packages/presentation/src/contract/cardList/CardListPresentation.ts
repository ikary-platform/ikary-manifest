import { z } from 'zod';

export const CardListLayoutColumnsSchema = z.enum(['1', '2', '3']);

export const CardListActionIntentSchema = z.enum(['default', 'neutral', 'danger']);

export const CardListBadgeToneSchema = z.enum(['neutral', 'info', 'success', 'warning', 'danger']);

export const CardListValueTypeSchema = z.enum([
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

export const CardListEmptyStateSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
  })
  .strict();

export const CardListActionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    actionKey: z.string().min(1).optional(),
    href: z.string().min(1).optional(),
    intent: CardListActionIntentSchema.optional(),
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

export const CardListFieldSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    field: z.string().min(1),
    valueType: CardListValueTypeSchema.optional(),
    emptyLabel: z.string().min(1).optional(),
  })
  .strict();

export const CardListMetricSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    field: z.string().min(1),
    valueType: z.enum(['number', 'currency', 'text']).optional(),
    supportingText: z.string().min(1).optional(),
  })
  .strict();

export const CardListCardSchema = z
  .object({
    titleField: z.string().min(1),

    subtitleField: z.string().min(1).optional(),

    badge: z
      .object({
        field: z.string().min(1),
        tone: CardListBadgeToneSchema.optional(),
      })
      .strict()
      .optional(),

    fields: z.array(CardListFieldSchema).optional(),
    metrics: z.array(CardListMetricSchema).optional(),
    actions: z.array(CardListActionSchema).optional(),
  })
  .strict();

export const CardListLayoutSchema = z
  .object({
    columns: CardListLayoutColumnsSchema.optional(),
  })
  .strict();

export const CardListPresentationSchema = z
  .object({
    type: z.literal('card-list'),

    layout: CardListLayoutSchema.optional(),
    card: CardListCardSchema,
    emptyState: CardListEmptyStateSchema.optional(),

    dense: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const fieldKeys = (value.card.fields ?? []).map((item) => item.key);
    const duplicateFieldKeys = fieldKeys.filter((key, index) => fieldKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateFieldKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['card', 'fields'],
        message: `duplicate field key "${key}"`,
      });
    }

    const metricKeys = (value.card.metrics ?? []).map((item) => item.key);
    const duplicateMetricKeys = metricKeys.filter((key, index) => metricKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateMetricKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['card', 'metrics'],
        message: `duplicate metric key "${key}"`,
      });
    }

    const actionKeys = (value.card.actions ?? []).map((action) => action.key);
    const duplicateActionKeys = actionKeys.filter((key, index) => actionKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateActionKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['card', 'actions'],
        message: `duplicate action key "${key}"`,
      });
    }

    if ((value.card.actions ?? []).length > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['card', 'actions'],
        message: 'CardList should expose at most 2 visible card actions in V1',
      });
    }

    if (!value.card.fields?.length && !value.card.metrics?.length && !value.card.badge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['card'],
        message: 'CardList card should define at least one of badge, fields, or metrics',
      });
    }
  });

export type CardListPresentation = z.infer<typeof CardListPresentationSchema>;
