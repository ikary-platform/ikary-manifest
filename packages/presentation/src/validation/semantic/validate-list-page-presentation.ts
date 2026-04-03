import type { ListPagePresentation } from '../../contract/list-page/ListPagePresentationSchema';
import type { PresentationValidationError } from '../types';

export function validateListPagePresentation(presentation: ListPagePresentation): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  // Header, navigation, and pagination should stay type-consistent
  if (presentation.header && presentation.header.type !== 'page-header') {
    errors.push({
      path: 'header.type',
      message: 'header must be a PageHeader presentation',
      code: 'LIST_PAGE_INVALID_HEADER_TYPE',
    });
  }

  if (presentation.navigation && presentation.navigation.type !== 'tabs') {
    errors.push({
      path: 'navigation.type',
      message: 'navigation must be a Tabs presentation',
      code: 'LIST_PAGE_INVALID_NAVIGATION_TYPE',
    });
  }

  if (presentation.pagination && presentation.pagination.type !== 'pagination') {
    errors.push({
      path: 'pagination.type',
      message: 'pagination must be a Pagination presentation',
      code: 'LIST_PAGE_INVALID_PAGINATION_TYPE',
    });
  }

  // Renderer mode must match renderer presentation type
  if (presentation.renderer.mode === 'data-grid' && presentation.renderer.presentation.type !== 'data-grid') {
    errors.push({
      path: 'renderer.presentation.type',
      message: 'renderer.mode "data-grid" requires a DataGrid presentation',
      code: 'LIST_PAGE_RENDERER_TYPE_MISMATCH',
    });
  }

  if (presentation.renderer.mode === 'card-list' && presentation.renderer.presentation.type !== 'card-list') {
    errors.push({
      path: 'renderer.presentation.type',
      message: 'renderer.mode "card-list" requires a CardList presentation',
      code: 'LIST_PAGE_RENDERER_TYPE_MISMATCH',
    });
  }

  // Filter keys must be unique
  const filterKeys = (presentation.controls?.filters?.items ?? []).map((item) => item.key);
  const duplicateFilterKeys = filterKeys.filter((key, index) => filterKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateFilterKeys)) {
    errors.push({
      path: 'controls.filters.items',
      message: `Duplicate filter key "${key}"`,
      code: 'LIST_PAGE_DUPLICATE_FILTER_KEY',
    });
  }

  // Search placeholder should only be set when search is visible
  if (presentation.controls?.search?.placeholder && presentation.controls.search.visible === false) {
    errors.push({
      path: 'controls.search.placeholder',
      message: 'search.placeholder is only useful when search is visible',
      code: 'LIST_PAGE_SEARCH_PLACEHOLDER_WITHOUT_SEARCH',
    });
  }

  // Filters mode should only be meaningful when filters are visible
  if (presentation.controls?.filters?.mode && presentation.controls.filters.visible === false) {
    errors.push({
      path: 'controls.filters.mode',
      message: 'filters.mode is only useful when filters are visible',
      code: 'LIST_PAGE_FILTER_MODE_WITHOUT_FILTERS',
    });
  }

  // Sorting mode should only be meaningful when sorting is visible
  if (presentation.controls?.sorting?.mode && presentation.controls.sorting.visible === false) {
    errors.push({
      path: 'controls.sorting.mode',
      message: 'sorting.mode is only useful when sorting is visible',
      code: 'LIST_PAGE_SORTING_MODE_WITHOUT_SORTING',
    });
  }

  // Bulk actions visibility flag is only meaningful when the control surface exists
  if (presentation.controls?.bulkActions?.visibleWhenSelection === false) {
    errors.push({
      path: 'controls.bulkActions.visibleWhenSelection',
      message: 'bulkActions.visibleWhenSelection=false makes the bulk action surface meaningless',
      code: 'LIST_PAGE_BULK_ACTIONS_DISABLED',
    });
  }

  // Empty state title should remain meaningful
  if (
    presentation.emptyState &&
    (!presentation.emptyState.title || presentation.emptyState.title.trim().length === 0)
  ) {
    errors.push({
      path: 'emptyState.title',
      message: 'emptyState title is required',
      code: 'LIST_PAGE_EMPTY_STATE_TITLE_REQUIRED',
    });
  }

  return errors;
}
