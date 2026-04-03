import { z } from 'zod';

export const SelectOptionPresentationSchema = z
  .object({
    value: z.string().min(1),
    label: z.string().min(1),
    disabled: z.boolean().optional(),
    description: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
  })
  .strict();

export const SelectPresentationSchema = z
  .object({
    value: z.string().optional(),
    defaultValue: z.string().optional(),
    placeholder: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
    required: z.boolean().optional(),
    invalid: z.boolean().optional(),
    loading: z.boolean().optional(),
    name: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    options: z.array(SelectOptionPresentationSchema),
    emptyMessage: z.string().min(1).optional(),
    leadingIcon: z.string().min(1).optional(),
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

    const optionValues = value.options.map((option) => option.value);
    const duplicateOptionValues = optionValues.filter(
      (optionValue, index) => optionValues.indexOf(optionValue) !== index,
    );

    for (const optionValue of new Set(duplicateOptionValues)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `duplicate option value "${optionValue}"`,
      });
    }
  });

export type SelectPresentation = z.infer<typeof SelectPresentationSchema>;
export type SelectOptionPresentation = z.infer<typeof SelectOptionPresentationSchema>;
