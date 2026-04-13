import { z } from 'zod';

export const PaginationBreakpointSchema = z.enum(['sm', 'md', 'lg']);

export const PaginationPageListModeSchema = z.enum(['compact-ellipsis']);

export const PaginationVisibilitySchema = z
  .object({
    hideWhenSinglePage: z.boolean().optional(),
  })
  .strict();

export const PaginationRangeSchema = z
  .object({
    visible: z.boolean().optional(),
    format: z.literal('start-end-of-total').optional(),
  })
  .strict();

export const PaginationPageSizeSchema = z
  .object({
    visible: z.boolean().optional(),
    options: z.array(z.number().int().positive()).min(1).optional(),
    label: z.string().min(1).optional(),
  })
  .strict();

export const PaginationNavigationSchema = z
  .object({
    showFirst: z.boolean().optional(),
    showLast: z.boolean().optional(),
    showPrevious: z.boolean().optional(),
    showNext: z.boolean().optional(),
    showPageList: z.boolean().optional(),
    pageListMode: PaginationPageListModeSchema.optional(),
    maxVisiblePages: z.number().int().min(5).max(11).optional(),
  })
  .strict();

export const PaginationSummarySchema = z
  .object({
    visible: z.boolean().optional(),
    format: z.literal('page-x-of-y').optional(),
  })
  .strict();

export const PaginationResponsiveSchema = z
  .object({
    collapsePageListBelow: PaginationBreakpointSchema.optional(),
    stackBelow: PaginationBreakpointSchema.optional(),
  })
  .strict();

export const PaginationPresentationSchema = z
  .object({
    type: z.literal('pagination'),

    visibility: PaginationVisibilitySchema.optional(),
    range: PaginationRangeSchema.optional(),
    pageSize: PaginationPageSizeSchema.optional(),
    navigation: PaginationNavigationSchema.optional(),
    summary: PaginationSummarySchema.optional(),
    responsive: PaginationResponsiveSchema.optional(),

    dense: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const options = value.pageSize?.options;
    if (options) {
      const duplicateOptions = options.filter((option, index) => options.indexOf(option) !== index);

      for (const option of new Set(duplicateOptions)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pageSize', 'options'],
          message: `duplicate page size option "${option}"`,
        });
      }
    }

    const showPageList = value.navigation?.showPageList;
    const maxVisiblePages = value.navigation?.maxVisiblePages;

    if (showPageList === false && maxVisiblePages !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['navigation', 'maxVisiblePages'],
        message: 'maxVisiblePages is only allowed when showPageList is enabled',
      });
    }

    if (maxVisiblePages !== undefined && maxVisiblePages % 2 === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['navigation', 'maxVisiblePages'],
        message: 'maxVisiblePages should be an odd number for stable compact ellipsis behavior',
      });
    }
  });

export type PaginationPresentation = z.infer<typeof PaginationPresentationSchema>;
