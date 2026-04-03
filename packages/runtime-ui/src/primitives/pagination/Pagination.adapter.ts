import type { PaginationPresentation } from '@ikary-manifest/presentation';
import type {
  PaginationViewProps,
  PaginationRangeFormat,
  PaginationSummaryFormat,
  PaginationPageListMode,
} from './Pagination.types';

export type BuildPaginationViewModelInput = {
  presentation: PaginationPresentation;

  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export function buildPaginationViewModel(input: BuildPaginationViewModelInput): PaginationViewProps {
  const safeTotalPages = Math.max(1, input.totalPages || 1);
  const safePage = clamp(input.page || 1, 1, safeTotalPages);
  const safePageSize = Math.max(1, input.pageSize || 1);

  const pageSizeOptions = normalizePageSizeOptions(input.presentation.pageSize?.options, safePageSize);

  return {
    page: safePage,
    pageSize: safePageSize,
    totalItems: Math.max(0, input.totalItems || 0),
    totalPages: safeTotalPages,

    onPageChange: input.onPageChange,
    onPageSizeChange: input.onPageSizeChange,

    hideWhenSinglePage: input.presentation.visibility?.hideWhenSinglePage ?? true,

    showRange: input.presentation.range?.visible ?? true,
    rangeFormat: (input.presentation.range?.format as PaginationRangeFormat | undefined) ?? 'start-end-of-total',

    showPageSize: input.presentation.pageSize?.visible ?? true,
    pageSizeOptions,
    pageSizeLabel: input.presentation.pageSize?.label ?? 'Items per page',

    showFirst: input.presentation.navigation?.showFirst ?? true,
    showLast: input.presentation.navigation?.showLast ?? true,
    showPrevious: input.presentation.navigation?.showPrevious ?? true,
    showNext: input.presentation.navigation?.showNext ?? true,
    showPageList: input.presentation.navigation?.showPageList ?? true,
    pageListMode:
      (input.presentation.navigation?.pageListMode as PaginationPageListMode | undefined) ?? 'compact-ellipsis',
    maxVisiblePages: normalizeMaxVisiblePages(input.presentation.navigation?.maxVisiblePages),

    showSummary: input.presentation.summary?.visible ?? false,
    summaryFormat: (input.presentation.summary?.format as PaginationSummaryFormat | undefined) ?? 'page-x-of-y',

    collapsePageListBelow: input.presentation.responsive?.collapsePageListBelow,
    stackBelow: input.presentation.responsive?.stackBelow,
    dense: input.presentation.dense ?? false,
  };
}

function normalizePageSizeOptions(options: number[] | undefined, currentPageSize: number): number[] {
  const base = options && options.length > 0 ? options : [10, 25, 50, 100];

  const unique: number[] = [];
  for (const option of base) {
    const normalized = Math.max(1, Math.trunc(option));
    if (!unique.includes(normalized)) {
      unique.push(normalized);
    }
  }

  if (!unique.includes(currentPageSize)) {
    unique.push(currentPageSize);
  }

  return unique.sort((a, b) => a - b);
}

function normalizeMaxVisiblePages(value: number | undefined): number {
  const fallback = 7;
  if (!value) return fallback;

  let normalized = Math.max(5, Math.min(11, Math.trunc(value)));

  if (normalized % 2 === 0) {
    normalized -= 1;
  }

  return Math.max(5, normalized);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
