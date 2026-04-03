import type { PaginationBreakpoint, PaginationViewProps } from './Pagination.types';

type PageItem = number | 'ellipsis';

export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  hideWhenSinglePage,
  showRange,
  rangeFormat,
  showPageSize,
  pageSizeOptions,
  pageSizeLabel,
  showFirst,
  showLast,
  showPrevious,
  showNext,
  showPageList,
  pageListMode,
  maxVisiblePages,
  showSummary,
  summaryFormat,
  collapsePageListBelow,
  stackBelow,
  dense = false,
}: PaginationViewProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const currentPage = clamp(page, 1, safeTotalPages);

  if (hideWhenSinglePage && safeTotalPages <= 1) {
    return null;
  }

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

  const canGoFirst = currentPage > 1;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < safeTotalPages;
  const canGoLast = currentPage < safeTotalPages;

  const pageItems =
    showPageList && pageListMode === 'compact-ellipsis'
      ? buildCompactEllipsisPageItems(currentPage, safeTotalPages, maxVisiblePages)
      : [];

  const containerClass = [
    'rounded-md border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900',
  ].join(' ');

  const layoutClass = ['flex w-full items-center justify-between gap-3', stackLayoutClass(stackBelow)].join(' ');

  const leftClass = 'flex flex-wrap items-center gap-3';
  const rightClass = 'flex flex-wrap items-center gap-2';

  const controlHeightClass = dense ? 'h-7' : 'h-8';
  const textClass = dense ? 'text-[11px]' : 'text-xs';

  return (
    <div className={containerClass}>
      <div className={layoutClass}>
        <div className={leftClass}>
          {showRange && (
            <span className={`${textClass} text-gray-500 dark:text-gray-400`}>
              {formatRange(rangeFormat, rangeStart, rangeEnd, totalItems)}
            </span>
          )}

          {showSummary && (
            <span className={`${textClass} text-gray-500 dark:text-gray-400`}>
              {formatSummary(summaryFormat, currentPage, safeTotalPages)}
            </span>
          )}
        </div>

        <div className={rightClass}>
          {showPageSize && onPageSizeChange && (
            <label className={`flex items-center gap-2 ${textClass} text-gray-500 dark:text-gray-400`}>
              <span>{pageSizeLabel}</span>
              <select
                value={pageSize}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                className={`${controlHeightClass} rounded border border-gray-200 bg-white px-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200`}
                aria-label={pageSizeLabel}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="flex items-center gap-1.5">
            {showFirst && (
              <NavButton
                label="First"
                disabled={!canGoFirst}
                onClick={() => onPageChange(1)}
                heightClass={controlHeightClass}
              />
            )}

            {showPrevious && (
              <NavButton
                label="Prev"
                disabled={!canGoPrevious}
                onClick={() => onPageChange(currentPage - 1)}
                heightClass={controlHeightClass}
              />
            )}

            {showPageList && (
              <div className={`items-center gap-1 ${collapsePageListClass(collapsePageListBelow)}`}>
                {pageItems.map((item, index) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className={`${textClass} px-1 text-gray-400 dark:text-gray-500`}>
                      …
                    </span>
                  ) : (
                    <PageButton
                      key={item}
                      page={item}
                      active={item === currentPage}
                      onClick={() => onPageChange(item)}
                      heightClass={controlHeightClass}
                    />
                  ),
                )}
              </div>
            )}

            {showNext && (
              <NavButton
                label="Next"
                disabled={!canGoNext}
                onClick={() => onPageChange(currentPage + 1)}
                heightClass={controlHeightClass}
              />
            )}

            {showLast && (
              <NavButton
                label="Last"
                disabled={!canGoLast}
                onClick={() => onPageChange(safeTotalPages)}
                heightClass={controlHeightClass}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  heightClass,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  heightClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        heightClass,
        'rounded border border-gray-200 px-2.5 text-xs text-gray-700 transition-colors',
        'hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40',
        'dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function PageButton({
  page,
  active,
  onClick,
  heightClass,
}: {
  page: number;
  active: boolean;
  onClick: () => void;
  heightClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={[
        heightClass,
        'min-w-8 rounded border px-2 text-xs transition-colors',
        active
          ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
          : 'border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800',
      ].join(' ')}
    >
      {page}
    </button>
  );
}

function buildCompactEllipsisPageItems(currentPage: number, totalPages: number, maxVisiblePages: number): PageItem[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const siblingCount = Math.max(1, Math.floor((maxVisiblePages - 3) / 2));
  const items: PageItem[] = [];

  const leftSibling = Math.max(2, currentPage - siblingCount);
  const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);

  items.push(1);

  if (leftSibling > 2) {
    items.push('ellipsis');
  }

  for (let page = leftSibling; page <= rightSibling; page += 1) {
    items.push(page);
  }

  if (rightSibling < totalPages - 1) {
    items.push('ellipsis');
  }

  items.push(totalPages);

  return items;
}

function formatRange(format: 'start-end-of-total', start: number, end: number, total: number): string {
  if (format === 'start-end-of-total') {
    return `${start}–${end} of ${total}`;
  }

  return `${start}–${end} of ${total}`;
}

function formatSummary(format: 'page-x-of-y', page: number, totalPages: number): string {
  if (format === 'page-x-of-y') {
    return `Page ${page} of ${totalPages}`;
  }

  return `Page ${page} of ${totalPages}`;
}

function stackLayoutClass(breakpoint?: PaginationBreakpoint): string {
  switch (breakpoint) {
    case 'sm':
      return 'flex-col sm:flex-row';
    case 'md':
      return 'flex-col md:flex-row';
    case 'lg':
      return 'flex-col lg:flex-row';
    default:
      return 'flex-col lg:flex-row';
  }
}

function collapsePageListClass(breakpoint?: PaginationBreakpoint): string {
  switch (breakpoint) {
    case 'sm':
      return 'hidden sm:flex';
    case 'md':
      return 'hidden md:flex';
    case 'lg':
      return 'hidden lg:flex';
    default:
      return 'flex';
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
