import { z } from 'zod';
import { PageHeaderPresentationSchema } from '../page-header/PageHeaderPresentationSchema';
import { TabsPresentationSchema } from '../tabs/TabsPresentationSchema';
import { DataGridPresentationSchema } from '../data-grid/DataGridPresentationSchema';
import { CardListPresentationSchema } from '../cardList/CardListPresentation';
import { PaginationPresentationSchema } from '../pagination/PaginationPresentationSchema';

export const ListPageEmptyStateSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
  })
  .strict();

export const ListPageSearchSchema = z
  .object({
    visible: z.boolean().optional(),
    placeholder: z.string().min(1).optional(),
  })
  .strict();

export const ListPageFilterSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
  })
  .strict();

export const ListPageFiltersSchema = z
  .object({
    visible: z.boolean().optional(),
    mode: z.enum(['inline', 'drawer']).optional(),
    items: z.array(ListPageFilterSchema).optional(),
  })
  .strict();

export const ListPageSortingSchema = z
  .object({
    visible: z.boolean().optional(),
    mode: z.enum(['summary', 'controls']).optional(),
  })
  .strict();

export const ListPageBulkActionsSchema = z
  .object({
    visibleWhenSelection: z.boolean().optional(),
  })
  .strict();

export const ListPageControlsSchema = z
  .object({
    search: ListPageSearchSchema.optional(),
    filters: ListPageFiltersSchema.optional(),
    sorting: ListPageSortingSchema.optional(),
    bulkActions: ListPageBulkActionsSchema.optional(),
  })
  .strict();

export const ListPageRendererSchema = z.discriminatedUnion('mode', [
  z
    .object({
      mode: z.literal('data-grid'),
      presentation: DataGridPresentationSchema,
    })
    .strict(),
  z
    .object({
      mode: z.literal('card-list'),
      presentation: CardListPresentationSchema,
    })
    .strict(),
]);

export const ListPagePresentationSchema = z
  .object({
    type: z.literal('list-page'),

    header: PageHeaderPresentationSchema.optional(),
    navigation: TabsPresentationSchema.optional(),
    controls: ListPageControlsSchema.optional(),

    renderer: ListPageRendererSchema,

    pagination: PaginationPresentationSchema.optional(),
    emptyState: ListPageEmptyStateSchema.optional(),

    dense: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const filterKeys = (value.controls?.filters?.items ?? []).map((item) => item.key);
    const duplicateFilterKeys = filterKeys.filter((key, index) => filterKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateFilterKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['controls', 'filters', 'items'],
        message: `duplicate filter key "${key}"`,
      });
    }

    /* v8 ignore next 7 -- discriminated union ensures mode and presentation.type always agree */
    if (value.renderer.mode === 'data-grid' && value.renderer.presentation.type !== 'data-grid') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['renderer', 'presentation', 'type'],
        message: 'renderer.mode "data-grid" requires a DataGrid presentation',
      });
    }

    /* v8 ignore next 7 -- discriminated union ensures mode and presentation.type always agree */
    if (value.renderer.mode === 'card-list' && value.renderer.presentation.type !== 'card-list') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['renderer', 'presentation', 'type'],
        message: 'renderer.mode "card-list" requires a CardList presentation',
      });
    }

    /* v8 ignore next 7 -- PageHeaderPresentationSchema enforces type:'page-header' before superRefine runs */
    if (value.header && value.header.type !== 'page-header') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['header', 'type'],
        message: 'header must be a PageHeader presentation',
      });
    }

    /* v8 ignore next 7 -- TabsPresentationSchema enforces type:'tabs' before superRefine runs */
    if (value.navigation && value.navigation.type !== 'tabs') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['navigation', 'type'],
        message: 'navigation must be a Tabs presentation',
      });
    }

    /* v8 ignore next 7 -- PaginationPresentationSchema enforces type:'pagination' before superRefine runs */
    if (value.pagination && value.pagination.type !== 'pagination') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pagination', 'type'],
        message: 'pagination must be a Pagination presentation',
      });
    }
  });

export type ListPagePresentation = z.infer<typeof ListPagePresentationSchema>;
