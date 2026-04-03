import { PaginationPresentationSchema, type PaginationPresentation } from '@ikary-manifest/presentation';

export const PAGINATION_PRESENTATION_EXAMPLE: PaginationPresentation = PaginationPresentationSchema.parse({
  type: 'pagination',
  visibility: {
    hideWhenSinglePage: true,
  },
  range: {
    visible: true,
    format: 'start-end-of-total',
  },
  pageSize: {
    visible: true,
    options: [10, 25, 50, 100],
    label: 'Items per page',
  },
  navigation: {
    showFirst: true,
    showLast: true,
    showPrevious: true,
    showNext: true,
    showPageList: true,
    pageListMode: 'compact-ellipsis',
    maxVisiblePages: 7,
  },
  responsive: {
    collapsePageListBelow: 'md',
    stackBelow: 'lg',
  },
});

export const PAGINATION_RUNTIME_EXAMPLE = {
  page: 2,
  pageSize: 25,
  totalItems: 132,
  totalPages: 6,
};
