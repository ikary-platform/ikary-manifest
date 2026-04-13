import { z } from 'zod';
import { FormFieldPresentationSchema } from '../form-field/FormFieldPresentationSchema';

export const FormSectionLayoutSchema = z.enum(['stack', 'two-column']);

export const FormSectionStatusSchema = z.enum(['default', 'readonly', 'disabled', 'warning', 'error', 'complete']);

export const FormSectionActionIntentSchema = z.enum(['default', 'neutral', 'danger']);

export const FormSectionActionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    actionKey: z.string().min(1).optional(),
    href: z.string().min(1).optional(),
    intent: FormSectionActionIntentSchema.optional(),
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

export const FormSectionPresentationSchema = z
  .object({
    type: z.literal('form-section'),

    key: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1).optional(),

    layout: FormSectionLayoutSchema.optional(),

    fields: z.array(FormFieldPresentationSchema).min(1),

    actions: z.array(FormSectionActionSchema).optional(),

    collapsible: z.boolean().optional(),
    defaultExpanded: z.boolean().optional(),

    readonly: z.boolean().optional(),
    disabled: z.boolean().optional(),
    status: FormSectionStatusSchema.optional(),

    dense: z.boolean().optional(),
    testId: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const fieldKeys = value.fields.map((field) => field.key);
    const duplicateFieldKeys = fieldKeys.filter((key, index) => fieldKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateFieldKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fields'],
        message: `duplicate field key "${key}"`,
      });
    }

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
        message: 'FormSection should expose at most 2 section actions in V1',
      });
    }

    if (value.defaultExpanded !== undefined && value.collapsible !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['defaultExpanded'],
        message: 'defaultExpanded is only allowed when collapsible=true',
      });
    }

    if (value.layout === 'two-column') {
      const hasBlockingField = value.fields.some(
        (field) => field.variant === 'relation' || (field.variant === 'standard' && field.control === 'textarea'),
      );

      if (hasBlockingField) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['layout'],
          message: 'two-column layout should not be used with textarea or relation form fields',
        });
      }
    }
  });

export type FormSectionPresentation = z.infer<typeof FormSectionPresentationSchema>;
export type FormSectionLayout = z.infer<typeof FormSectionLayoutSchema>;
export type FormSectionStatus = z.infer<typeof FormSectionStatusSchema>;
export type FormSectionActionIntent = z.infer<typeof FormSectionActionIntentSchema>;
