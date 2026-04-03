import { z } from 'zod';

export const DetailItemKindSchema = z.enum([
  'text',
  'long-text',
  'date',
  'datetime',
  'boolean',
  'status',
  'badge-list',
  'link',
  'user-reference',
  'entity-reference',
  'list-summary',
]);

export const DetailItemToneSchema = z.enum(['neutral', 'info', 'success', 'warning', 'danger']);

export const DetailItemLinkTargetSchema = z.enum(['internal', 'external']);

export const DetailItemDateStyleSchema = z.enum(['short', 'medium', 'long']);

const DetailItemBaseSchema = z
  .object({
    type: z.literal('detail-item'),
    key: z.string().min(1),
    label: z.string().min(1),
    field: z.string().min(1),
    emptyLabel: z.string().min(1).optional(),
    truncate: z.boolean().optional(),
    tooltip: z.boolean().optional(),
    dense: z.boolean().optional(),
    loading: z.boolean().optional(),
    errorLabel: z.string().min(1).optional(),
    testId: z.string().min(1).optional(),
  })
  .strict();

const DetailItemTextSchema = DetailItemBaseSchema.extend({
  kind: z.literal('text'),
});

const DetailItemLongTextSchema = DetailItemBaseSchema.extend({
  kind: z.literal('long-text'),
});

const DetailItemDateSchema = DetailItemBaseSchema.extend({
  kind: z.literal('date'),
  format: z
    .object({
      dateStyle: DetailItemDateStyleSchema.optional(),
    })
    .strict()
    .optional(),
});

const DetailItemDateTimeSchema = DetailItemBaseSchema.extend({
  kind: z.literal('datetime'),
  format: z
    .object({
      datetimeStyle: DetailItemDateStyleSchema.optional(),
    })
    .strict()
    .optional(),
});

const DetailItemBooleanSchema = DetailItemBaseSchema.extend({
  kind: z.literal('boolean'),
  labels: z
    .object({
      trueLabel: z.string().min(1).optional(),
      falseLabel: z.string().min(1).optional(),
    })
    .strict()
    .optional(),
});

const DetailItemStatusSchema = DetailItemBaseSchema.extend({
  kind: z.literal('status'),
  tone: DetailItemToneSchema.optional(),
});

const DetailItemBadgeListSchema = DetailItemBaseSchema.extend({
  kind: z.literal('badge-list'),
  tone: DetailItemToneSchema.optional(),
  maxVisible: z.number().int().positive().optional(),
});

const DetailItemLinkSchema = DetailItemBaseSchema.extend({
  kind: z.literal('link'),
  link: z
    .object({
      target: DetailItemLinkTargetSchema.optional(),
    })
    .strict()
    .optional(),
});

const DetailItemUserReferenceSchema = DetailItemBaseSchema.extend({
  kind: z.literal('user-reference'),
  link: z
    .object({
      target: DetailItemLinkTargetSchema.optional(),
    })
    .strict()
    .optional(),
  showSecondary: z.boolean().optional(),
});

const DetailItemEntityReferenceSchema = DetailItemBaseSchema.extend({
  kind: z.literal('entity-reference'),
  link: z
    .object({
      target: DetailItemLinkTargetSchema.optional(),
    })
    .strict()
    .optional(),
  showSecondary: z.boolean().optional(),
});

const DetailItemListSummarySchema = DetailItemBaseSchema.extend({
  kind: z.literal('list-summary'),
  maxVisible: z.number().int().positive().optional(),
});

export const DetailItemSchema = z
  .discriminatedUnion('kind', [
    DetailItemTextSchema,
    DetailItemLongTextSchema,
    DetailItemDateSchema,
    DetailItemDateTimeSchema,
    DetailItemBooleanSchema,
    DetailItemStatusSchema,
    DetailItemBadgeListSchema,
    DetailItemLinkSchema,
    DetailItemUserReferenceSchema,
    DetailItemEntityReferenceSchema,
    DetailItemListSummarySchema,
  ])
  .superRefine((value, ctx) => {
    if (value.kind === 'long-text' && value.truncate === true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truncate'],
        message: 'truncate should not be enabled for long-text detail items',
      });
    }

    if (value.kind === 'badge-list' && value.truncate === true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truncate'],
        message: 'truncate is not supported for badge-list detail items',
      });
    }
  });

export const DetailItemPresentationSchema = DetailItemSchema;

export type DetailItem = z.infer<typeof DetailItemSchema>;
export type DetailItemPresentation = DetailItem;
export type DetailItemKind = z.infer<typeof DetailItemKindSchema>;
export type DetailItemTone = z.infer<typeof DetailItemToneSchema>;
export type DetailItemLinkTarget = z.infer<typeof DetailItemLinkTargetSchema>;
export type DetailItemDateStyle = z.infer<typeof DetailItemDateStyleSchema>;
