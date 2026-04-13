import { z } from 'zod';

export const InputTypeSchema = z.enum(['text', 'email', 'password', 'number', 'search', 'url', 'tel']);

export const InputValueSchema = z.union([z.string(), z.number()]);

export const InputPresentationSchema = z
  .object({
    inputType: InputTypeSchema.optional(),
    value: InputValueSchema.optional(),
    defaultValue: InputValueSchema.optional(),
    placeholder: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
    readonly: z.boolean().optional(),
    required: z.boolean().optional(),
    invalid: z.boolean().optional(),
    loading: z.boolean().optional(),
    name: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    leadingIcon: z.string().min(1).optional(),
    trailingIcon: z.string().min(1).optional(),
    leadingText: z.string().min(1).optional(),
    trailingText: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.value !== undefined && value.defaultValue !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['defaultValue'],
        message: 'value and defaultValue cannot both be set',
      });
    }
  });

export type InputPresentation = z.infer<typeof InputPresentationSchema>;
export type InputType = z.infer<typeof InputTypeSchema>;
export type InputValue = z.infer<typeof InputValueSchema>;
