import { z } from 'zod';

export const ErrorStateVariantSchema = z.enum(['page', 'section', 'inline', 'network', 'unexpected', 'notFound']);

export const ErrorStateSeveritySchema = z.enum(['soft', 'blocking']);

export const ErrorStateRetryActionSchema = z
  .object({
    label: z.string().min(1),
    actionKey: z.string().min(1).optional(),
  })
  .strict();

export const ErrorStateSecondaryActionSchema = z
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
        message: 'actionKey or href is required when secondaryAction is provided',
      });
    }
  });

export const ErrorStateTechnicalDetailsSchema = z
  .object({
    code: z.string().min(1).optional(),
    correlationId: z.string().min(1).optional(),
    message: z.string().min(1).optional(),
  })
  .strict();

export const ErrorStatePresentationSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    variant: ErrorStateVariantSchema.optional(),
    severity: ErrorStateSeveritySchema.optional(),
    retryAction: ErrorStateRetryActionSchema.optional(),
    secondaryAction: ErrorStateSecondaryActionSchema.optional(),
    technicalDetails: ErrorStateTechnicalDetailsSchema.optional(),
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

    if (value.retryAction && value.retryAction.label.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['retryAction', 'label'],
        message: 'retryAction.label must not be blank',
      });
    }

    if (value.secondaryAction && value.secondaryAction.label.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondaryAction', 'label'],
        message: 'secondaryAction.label must not be blank',
      });
    }

    if (value.description !== undefined && value.description.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['description'],
        message: 'description must not be blank',
      });
    }

    if (value.icon !== undefined && value.icon.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['icon'],
        message: 'icon must not be blank',
      });
    }
  });

export type ErrorStatePresentation = z.infer<typeof ErrorStatePresentationSchema>;
export type ErrorStateVariant = z.infer<typeof ErrorStateVariantSchema>;
export type ErrorStateSeverity = z.infer<typeof ErrorStateSeveritySchema>;
export type ErrorStateRetryAction = z.infer<typeof ErrorStateRetryActionSchema>;
export type ErrorStateSecondaryAction = z.infer<typeof ErrorStateSecondaryActionSchema>;
export type ErrorStateTechnicalDetails = z.infer<typeof ErrorStateTechnicalDetailsSchema>;
