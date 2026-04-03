import { z } from 'zod';

export const PageHeaderActionIntentSchema = z.enum(['default', 'neutral', 'danger']);

export const PageHeaderMetaToneSchema = z.enum(['neutral', 'info', 'success', 'warning', 'danger']);

export const PageHeaderLowerSlotTypeSchema = z.enum(['tabs', 'summary-strip', 'sub-navigation', 'helper-content']);

export const PageHeaderBreadcrumbSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    href: z.string().min(1).optional(),
  })
  .strict();

export const PageHeaderMetaItemSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('text'),
      key: z.string().min(1),
      label: z.string().min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal('badge'),
      key: z.string().min(1),
      label: z.string().min(1),
      tone: PageHeaderMetaToneSchema.optional(),
    })
    .strict(),
]);

export const PageHeaderActionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),

    /**
     * Stable runtime action reference.
     * Runtime resolves this into an executable handler.
     */
    actionKey: z.string().min(1).optional(),

    /**
     * Optional direct navigation target.
     * Use when the action is a navigation action instead of a runtime command.
     */
    href: z.string().min(1).optional(),

    intent: PageHeaderActionIntentSchema.optional(),
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

export const PageHeaderLowerSlotSchema = z
  .object({
    type: PageHeaderLowerSlotTypeSchema,
  })
  .strict();

export const PageHeaderPresentationSchema = z
  .object({
    type: z.literal('page-header'),

    title: z.string().min(1),
    description: z.string().min(1).optional(),
    eyebrow: z.string().min(1).optional(),

    breadcrumbs: z.array(PageHeaderBreadcrumbSchema).optional(),
    meta: z.array(PageHeaderMetaItemSchema).optional(),

    primaryAction: PageHeaderActionSchema.optional(),
    secondaryActions: z.array(PageHeaderActionSchema).optional(),

    lowerSlot: PageHeaderLowerSlotSchema.optional(),

    dense: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const breadcrumbKeys = (value.breadcrumbs ?? []).map((item) => item.key);
    const duplicateBreadcrumbKeys = breadcrumbKeys.filter((key, index) => breadcrumbKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateBreadcrumbKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['breadcrumbs'],
        message: `duplicate breadcrumb key "${key}"`,
      });
    }

    const metaKeys = (value.meta ?? []).map((item) => item.key);
    const duplicateMetaKeys = metaKeys.filter((key, index) => metaKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateMetaKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['meta'],
        message: `duplicate meta key "${key}"`,
      });
    }

    const secondaryActionKeys = (value.secondaryActions ?? []).map((action) => action.key);
    const duplicateSecondaryActionKeys = secondaryActionKeys.filter(
      (key, index) => secondaryActionKeys.indexOf(key) !== index,
    );

    for (const key of new Set(duplicateSecondaryActionKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondaryActions'],
        message: `duplicate secondary action key "${key}"`,
      });
    }

    if (value.primaryAction) {
      const primaryKey = value.primaryAction.key;
      if ((value.secondaryActions ?? []).some((action) => action.key === primaryKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['secondaryActions'],
          message: `secondary action key "${primaryKey}" conflicts with primary action key`,
        });
      }
    }

    if ((value.secondaryActions ?? []).length > 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondaryActions'],
        message: 'page header should expose at most 3 secondary actions before overflow handling',
      });
    }
  });

export type PageHeaderPresentation = z.infer<typeof PageHeaderPresentationSchema>;
