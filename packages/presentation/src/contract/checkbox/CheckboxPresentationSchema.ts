import { z } from 'zod';

export const CheckboxPresentationSchema = z
  .object({
    checked: z.boolean().optional(),
    defaultChecked: z.boolean().optional(),
    disabled: z.boolean().optional(),
    required: z.boolean().optional(),
    invalid: z.boolean().optional(),
    loading: z.boolean().optional(),
    name: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    label: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.checked !== undefined && value.defaultChecked !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['defaultChecked'],
        message: 'checked and defaultChecked cannot both be set',
      });
    }
  });

export type CheckboxPresentation = z.infer<typeof CheckboxPresentationSchema>;
