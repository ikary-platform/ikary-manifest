import { z } from 'zod';

export const FilterBarVariantSchema = z.enum(['list', 'section', 'widget']);

export const FilterBarDensitySchema = z.enum(['comfortable', 'compact']);

export const FilterBarControlTypeSchema = z.enum([
  'text',
  'select',
  'multi-select',
  'checkbox',
  'toggle',
  'date',
  'date-range',
  'number',
]);

export const FilterBarOptionSchema = z
  .object({
    value: z.string().min(1),
    label: z.string().min(1),
  })
  .strict();

export const FilterBarSearchSchema = z
  .object({
    value: z.string().optional(),
    placeholder: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
  })
  .strict();

export const FilterBarFilterSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    type: FilterBarControlTypeSchema,
    value: z.unknown().optional(),
    placeholder: z.string().min(1).optional(),
    options: z.array(FilterBarOptionSchema).optional(),
    disabled: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const needsOptions = value.type === 'select' || value.type === 'multi-select';

    if (needsOptions && (!value.options || value.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `options are required when filter type is "${value.type}"`,
      });
    }

    if (!needsOptions && value.options && value.options.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `options are only allowed for select and multi-select filter types`,
      });
    }
  });

export const FilterBarSortSchema = z
  .object({
    value: z.string().optional(),
    placeholder: z.string().min(1).optional(),
    options: z.array(FilterBarOptionSchema).min(1),
    disabled: z.boolean().optional(),
  })
  .strict();

export const FilterBarActiveFilterSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    valueLabel: z.string().min(1),
  })
  .strict();

export const FilterBarClearActionSchema = z
  .object({
    label: z.string().min(1),
    actionKey: z.string().min(1).optional(),
  })
  .strict();

export const FilterBarAdvancedFiltersSchema = z
  .object({
    enabled: z.boolean().optional(),
    open: z.boolean().optional(),
    label: z.string().min(1).optional(),
  })
  .strict();

export const FilterBarPresentationSchema = z
  .object({
    variant: FilterBarVariantSchema.optional(),
    density: FilterBarDensitySchema.optional(),

    search: FilterBarSearchSchema.optional(),
    filters: z.array(FilterBarFilterSchema).optional(),
    sort: FilterBarSortSchema.optional(),

    activeFilters: z.array(FilterBarActiveFilterSchema).optional(),

    clearAction: FilterBarClearActionSchema.optional(),
    advancedFilters: FilterBarAdvancedFiltersSchema.optional(),

    loading: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const filterKeys = (value.filters ?? []).map((filter) => filter.key);
    const duplicateFilterKeys = filterKeys.filter((key, index) => filterKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateFilterKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['filters'],
        message: `duplicate filter key "${key}"`,
      });
    }

    const sortOptionValues = (value.sort?.options ?? []).map((option) => option.value);
    const duplicateSortOptionValues = sortOptionValues.filter(
      (optionValue, index) => sortOptionValues.indexOf(optionValue) !== index,
    );

    for (const optionValue of new Set(duplicateSortOptionValues)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sort', 'options'],
        message: `duplicate sort option value "${optionValue}"`,
      });
    }
  });

export type FilterBarPresentation = z.infer<typeof FilterBarPresentationSchema>;
export type FilterBarVariant = z.infer<typeof FilterBarVariantSchema>;
export type FilterBarDensity = z.infer<typeof FilterBarDensitySchema>;
export type FilterBarControlType = z.infer<typeof FilterBarControlTypeSchema>;
export type FilterBarOption = z.infer<typeof FilterBarOptionSchema>;
export type FilterBarFilter = z.infer<typeof FilterBarFilterSchema>;
export type FilterBarSort = z.infer<typeof FilterBarSortSchema>;
export type FilterBarActiveFilter = z.infer<typeof FilterBarActiveFilterSchema>;
