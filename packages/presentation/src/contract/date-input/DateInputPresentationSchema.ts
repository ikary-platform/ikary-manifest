import { z } from 'zod';

export const DateInputPresentationSchema = z
  .object({
    value: z.string().optional(),
    defaultValue: z.string().optional(),
    placeholder: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
    readonly: z.boolean().optional(),
    required: z.boolean().optional(),
    invalid: z.boolean().optional(),
    loading: z.boolean().optional(),
    name: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
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

export type DateInputPresentation = z.infer<typeof DateInputPresentationSchema>;
