import type { PaginationPresentation } from '../../contract/pagination/PaginationPresentationSchema';
import type { PresentationValidationError } from '../types';

export function validatePaginationPresentation(presentation: PaginationPresentation): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  // Range/total is mandatory when pagination is visible.
  // Since the contract models total through the range expression, range must stay visible.
  if (presentation.range?.visible === false) {
    errors.push({
      path: 'range.visible',
      message: 'Pagination range must remain visible in the canonical IKARY primitive',
      code: 'PAGINATION_RANGE_REQUIRED',
    });
  }

  // Previous / next are part of the canonical baseline.
  if (presentation.navigation?.showPrevious === false) {
    errors.push({
      path: 'navigation.showPrevious',
      message: 'Previous navigation must remain enabled in the canonical IKARY primitive',
      code: 'PAGINATION_PREVIOUS_REQUIRED',
    });
  }

  if (presentation.navigation?.showNext === false) {
    errors.push({
      path: 'navigation.showNext',
      message: 'Next navigation must remain enabled in the canonical IKARY primitive',
      code: 'PAGINATION_NEXT_REQUIRED',
    });
  }

  // If page size selector is visible and explicit options are provided,
  // a single option is not useful as a selector.
  const pageSizeVisible = presentation.pageSize?.visible ?? true;
  const pageSizeOptions = presentation.pageSize?.options;

  if (pageSizeVisible && pageSizeOptions && pageSizeOptions.length < 2) {
    errors.push({
      path: 'pageSize.options',
      message: 'At least two page size options are required when the page size selector is visible',
      code: 'PAGINATION_PAGE_SIZE_OPTIONS_TOO_SMALL',
    });
  }

  // Recommended enterprise defaults are ascending typed values.
  if (pageSizeOptions) {
    const hasDescendingPair = pageSizeOptions.some((value, index) => {
      if (index === 0) return false;
      return value < pageSizeOptions[index - 1]!;
    });

    if (hasDescendingPair) {
      errors.push({
        path: 'pageSize.options',
        message: 'Page size options must be sorted in ascending order',
        code: 'PAGINATION_PAGE_SIZE_OPTIONS_NOT_SORTED',
      });
    }
  }

  // Compact page list is the only supported V1 model.
  if (
    presentation.navigation?.showPageList !== false &&
    presentation.navigation?.pageListMode &&
    presentation.navigation.pageListMode !== 'compact-ellipsis'
  ) {
    errors.push({
      path: 'navigation.pageListMode',
      message: 'Only compact-ellipsis page list mode is allowed in V1',
      code: 'PAGINATION_UNSUPPORTED_PAGE_LIST_MODE',
    });
  }

  return errors;
}
