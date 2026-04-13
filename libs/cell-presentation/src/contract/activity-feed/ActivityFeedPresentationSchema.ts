import { z } from 'zod';

export const ActivityFeedVariantSchema = z.enum(['default', 'compact', 'timeline']);

export const ActivityFeedDensitySchema = z.enum(['comfortable', 'compact']);

export const ActivityFeedToneSchema = z.enum(['default', 'info', 'success', 'warning', 'danger']);

export const ActivityFeedActionSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().min(1).optional(),
    actionKey: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.href && !value.actionKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actionKey'],
        message: 'href or actionKey is required when action is provided',
      });
    }
  });

export const ActivityFeedItemSchema = z
  .object({
    key: z.string().min(1),
    summary: z.string().min(1),
    actor: z.string().min(1).optional(),
    timestamp: z.string().min(1).optional(),
    targetLabel: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    tone: ActivityFeedToneSchema.optional(),
    href: z.string().min(1).optional(),
    actionKey: z.string().min(1).optional(),
  })
  .strict();

export const ActivityFeedRenderStateSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('loading'),
      state: z.unknown(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('empty'),
      state: z.unknown(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('error'),
      state: z.unknown(),
    })
    .strict(),
]);

export const ActivityFeedPresentationSchema = z
  .object({
    variant: ActivityFeedVariantSchema.optional(),
    density: ActivityFeedDensitySchema.optional(),
    title: z.string().min(1).optional(),
    subtitle: z.string().min(1).optional(),
    items: z.array(ActivityFeedItemSchema),
    limit: z.number().int().min(0).optional(),
    action: ActivityFeedActionSchema.optional(),
    renderState: ActivityFeedRenderStateSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.action && value.action.label.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['action', 'label'],
        message: 'action.label must not be blank',
      });
    }

    const itemKeys = value.items.map((item) => item.key);
    const duplicateItemKeys = itemKeys.filter((key, index) => itemKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateItemKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items'],
        message: `duplicate item key "${key}"`,
      });
    }
  });

export type ActivityFeedPresentation = z.infer<typeof ActivityFeedPresentationSchema>;
export type ActivityFeedVariant = z.infer<typeof ActivityFeedVariantSchema>;
export type ActivityFeedDensity = z.infer<typeof ActivityFeedDensitySchema>;
export type ActivityFeedTone = z.infer<typeof ActivityFeedToneSchema>;
export type ActivityFeedAction = z.infer<typeof ActivityFeedActionSchema>;
export type ActivityFeedItem = z.infer<typeof ActivityFeedItemSchema>;
export type ActivityFeedRenderState = z.infer<typeof ActivityFeedRenderStateSchema>;
