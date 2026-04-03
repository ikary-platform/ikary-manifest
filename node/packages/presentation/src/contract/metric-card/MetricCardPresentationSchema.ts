import { z } from 'zod';

export const MetricCardVariantSchema = z.enum(['default', 'compact', 'emphasis']);

export const MetricCardDensitySchema = z.enum(['comfortable', 'compact']);

export const MetricCardDeltaDirectionSchema = z.enum(['up', 'down', 'neutral']);

export const MetricCardToneSchema = z.enum(['default', 'success', 'warning', 'danger', 'info']);

export const MetricCardActionSchema = z
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

export const MetricCardRenderStateSchema = z.discriminatedUnion('kind', [
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

export const MetricCardPresentationSchema = z
  .object({
    variant: MetricCardVariantSchema.optional(),
    density: MetricCardDensitySchema.optional(),
    label: z.string().min(1),
    value: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    delta: z.string().min(1).optional(),
    deltaDirection: MetricCardDeltaDirectionSchema.optional(),
    tone: MetricCardToneSchema.optional(),
    icon: z.string().min(1).optional(),
    action: MetricCardActionSchema.optional(),
    renderState: MetricCardRenderStateSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.label.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['label'],
        message: 'label must not be blank',
      });
    }

    if (value.value.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'value must not be blank',
      });
    }

    if (value.action && value.action.label.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['action', 'label'],
        message: 'action.label must not be blank',
      });
    }
  });

export type MetricCardPresentation = z.infer<typeof MetricCardPresentationSchema>;
export type MetricCardVariant = z.infer<typeof MetricCardVariantSchema>;
export type MetricCardDensity = z.infer<typeof MetricCardDensitySchema>;
export type MetricCardDeltaDirection = z.infer<typeof MetricCardDeltaDirectionSchema>;
export type MetricCardTone = z.infer<typeof MetricCardToneSchema>;
export type MetricCardAction = z.infer<typeof MetricCardActionSchema>;
export type MetricCardRenderState = z.infer<typeof MetricCardRenderStateSchema>;
