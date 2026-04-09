import { z } from 'zod';

export const TextareaPresentationSchema = z
  .object({
    value: z.string().optional(),
    defaultValue: z.string().optional(),
    placeholder: z.string().min(1).optional(),
    rows: z.number().int().positive().optional(),
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

export type TextareaPresentation = z.infer<typeof TextareaPresentationSchema>;
