import { z } from 'zod';

export const RadioGroupDirectionSchema = z.enum(['vertical', 'horizontal']);

export const RadioGroupOptionPresentationSchema = z
  .object({
    value: z.string().min(1),
    label: z.string().min(1),
    disabled: z.boolean().optional(),
    description: z.string().min(1).optional(),
  })
  .strict();

export const RadioGroupPresentationSchema = z
  .object({
    value: z.string().optional(),
    defaultValue: z.string().optional(),
    disabled: z.boolean().optional(),
    required: z.boolean().optional(),
    invalid: z.boolean().optional(),
    loading: z.boolean().optional(),
    name: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    direction: RadioGroupDirectionSchema.optional(),
    options: z.array(RadioGroupOptionPresentationSchema).min(1),
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

export type RadioGroupPresentation = z.infer<typeof RadioGroupPresentationSchema>;
export type RadioGroupDirection = z.infer<typeof RadioGroupDirectionSchema>;
export type RadioGroupOptionPresentation = z.infer<typeof RadioGroupOptionPresentationSchema>;
