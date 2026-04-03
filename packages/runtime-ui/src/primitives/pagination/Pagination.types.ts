export type PaginationBreakpoint = 'sm' | 'md' | 'lg';

export type PaginationPageListMode = 'compact-ellipsis';
export type PaginationRangeFormat = 'start-end-of-total';
export type PaginationSummaryFormat = 'page-x-of-y';

export type PaginationViewProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  hideWhenSinglePage: boolean;

  showRange: boolean;
  rangeFormat: PaginationRangeFormat;

  showPageSize: boolean;
  pageSizeOptions: number[];
  pageSizeLabel: string;

  showFirst: boolean;
  showLast: boolean;
  showPrevious: boolean;
  showNext: boolean;
  showPageList: boolean;
  pageListMode: PaginationPageListMode;
  maxVisiblePages: number;

  showSummary: boolean;
  summaryFormat: PaginationSummaryFormat;

  collapsePageListBelow?: PaginationBreakpoint;
  stackBelow?: PaginationBreakpoint;
  dense?: boolean;
};
