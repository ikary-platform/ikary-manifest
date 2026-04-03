import { z } from 'zod';

export const EmptyStateVariantSchema = z.enum(['initial', 'search', 'filter', 'relation', 'section', 'widget']);

export const EmptyStateDensitySchema = z.enum(['comfortable', 'compact']);

export const EmptyStateActionSchema = z
  .object({
    label: z.string().min(1),
    actionKey: z.string().min(1).optional(),
    href: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.actionKey && !value.href) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actionKey'],
        message: 'actionKey or href is required when an action is provided',
      });
    }
  });

export const EmptyStatePresentationSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    variant: EmptyStateVariantSchema.optional(),
    density: EmptyStateDensitySchema.optional(),
    primaryAction: EmptyStateActionSchema.optional(),
    secondaryAction: EmptyStateActionSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.title.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['title'],
        message: 'title must not be blank',
      });
    }

    if (value.primaryAction && value.primaryAction.label.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primaryAction', 'label'],
        message: 'primaryAction.label must not be blank',
      });
    }

    if (value.secondaryAction && value.secondaryAction.label.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondaryAction', 'label'],
        message: 'secondaryAction.label must not be blank',
      });
    }
  });

export type EmptyStatePresentation = z.infer<typeof EmptyStatePresentationSchema>;
export type EmptyStateVariant = z.infer<typeof EmptyStateVariantSchema>;
export type EmptyStateDensity = z.infer<typeof EmptyStateDensitySchema>;
