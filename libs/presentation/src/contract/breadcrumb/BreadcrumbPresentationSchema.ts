import { z } from 'zod';

export const BreadcrumbItemSchema = z
  .object({
    label: z.string().min(1).describe('Display text for the breadcrumb segment'),
    href: z.string().optional().describe('Navigation target; omit for the current (last) item'),
  })
  .strict();

export const BreadcrumbPresentationSchema = z
  .object({
    items: z
      .array(BreadcrumbItemSchema)
      .min(1)
      .describe('Ordered list of path segments; the last item represents the current page'),
    separator: z
      .enum(['slash', 'chevron'])
      .optional()
      .describe('Character rendered between segments; defaults to "slash"'),
  })
  .strict();

export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>;
export type BreadcrumbPresentation = z.infer<typeof BreadcrumbPresentationSchema>;
