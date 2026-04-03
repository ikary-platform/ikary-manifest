import { z } from 'zod';

export const LoadingStateVariantSchema = z.enum(['page', 'section', 'card', 'inline', 'overlay']);

export const LoadingStateDensitySchema = z.enum(['comfortable', 'compact']);

export const LoadingStateModeSchema = z.enum(['skeleton', 'spinner', 'mixed']);

export const LoadingStateSkeletonSchema = z
  .object({
    lines: z.number().int().positive().optional(),
    blocks: z.number().int().positive().optional(),
    avatar: z.boolean().optional(),
  })
  .strict();

export const LoadingStatePresentationSchema = z
  .object({
    variant: LoadingStateVariantSchema.optional(),
    density: LoadingStateDensitySchema.optional(),
    mode: LoadingStateModeSchema.optional(),
    label: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    skeleton: LoadingStateSkeletonSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.label !== undefined && value.label.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['label'],
        message: 'label must not be blank',
      });
    }

    if (value.description !== undefined && value.description.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['description'],
        message: 'description must not be blank',
      });
    }
  });

export type LoadingStatePresentation = z.infer<typeof LoadingStatePresentationSchema>;
export type LoadingStateVariant = z.infer<typeof LoadingStateVariantSchema>;
export type LoadingStateDensity = z.infer<typeof LoadingStateDensitySchema>;
export type LoadingStateMode = z.infer<typeof LoadingStateModeSchema>;
export type LoadingStateSkeleton = z.infer<typeof LoadingStateSkeletonSchema>;
