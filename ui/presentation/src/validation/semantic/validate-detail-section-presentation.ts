import type { DetailSectionPresentation } from '../../contract/detail-section/DetailSectionPresentationSchema';
import type { PresentationValidationError } from '../types';

export function validateDetailSectionPresentation(
  presentation: DetailSectionPresentation,
): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  // Title must remain meaningful
  if (!presentation.title || presentation.title.trim().length === 0) {
    errors.push({
      path: 'title',
      message: 'DetailSection title is required',
      code: 'DETAIL_SECTION_TITLE_REQUIRED',
    });
  }

  // Canonical rule: at most 2 visible section actions in V1
  if ((presentation.actions ?? []).length > 2) {
    errors.push({
      path: 'actions',
      message: 'DetailSection should expose at most 2 visible section actions in V1',
      code: 'DETAIL_SECTION_TOO_MANY_ACTIONS',
    });
  }

  // Action keys must be unique
  const actionKeys = (presentation.actions ?? []).map((action) => action.key);
  const duplicateActionKeys = actionKeys.filter((key, index) => actionKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateActionKeys)) {
    errors.push({
      path: 'actions',
      message: `Duplicate action key "${key}"`,
      code: 'DETAIL_SECTION_DUPLICATE_ACTION_KEY',
    });
  }

  // Validate action target semantics
  for (const [index, action] of (presentation.actions ?? []).entries()) {
    if (!action.actionKey && !action.href) {
      errors.push({
        path: `actions.${index}`,
        message: 'Action must define either actionKey or href',
        code: 'DETAIL_SECTION_ACTION_TARGET_REQUIRED',
      });
    }

    if (action.actionKey && action.href) {
      errors.push({
        path: `actions.${index}`,
        message: 'Action cannot define both actionKey and href at the same time',
        code: 'DETAIL_SECTION_ACTION_TARGET_CONFLICT',
      });
    }
  }

  // Content-specific validation
  switch (presentation.content.mode) {
    case 'field-list':
    case 'field-grid': {
      const itemKeys = presentation.content.items.map((item) => item.key);
      const duplicateItemKeys = itemKeys.filter((key, index) => itemKeys.indexOf(key) !== index);

      for (const key of new Set(duplicateItemKeys)) {
        errors.push({
          path: 'content.items',
          message: `Duplicate field item key "${key}"`,
          code: 'DETAIL_SECTION_DUPLICATE_FIELD_ITEM_KEY',
        });
      }

      if (presentation.content.items.length === 0) {
        errors.push({
          path: 'content.items',
          message: 'DetailSection must contain at least one field item',
          code: 'DETAIL_SECTION_FIELD_ITEMS_REQUIRED',
        });
      }

      if (
        presentation.content.mode === 'field-grid' &&
        presentation.content.columns !== undefined &&
        presentation.content.columns !== 2 &&
        presentation.content.columns !== 3
      ) {
        errors.push({
          path: 'content.columns',
          message: 'field-grid supports only 2 or 3 columns in V1',
          code: 'DETAIL_SECTION_INVALID_GRID_COLUMNS',
        });
      }

      break;
    }

    case 'metric-list': {
      const itemKeys = presentation.content.items.map((item) => item.key);
      const duplicateItemKeys = itemKeys.filter((key, index) => itemKeys.indexOf(key) !== index);

      for (const key of new Set(duplicateItemKeys)) {
        errors.push({
          path: 'content.items',
          message: `Duplicate metric item key "${key}"`,
          code: 'DETAIL_SECTION_DUPLICATE_METRIC_ITEM_KEY',
        });
      }

      if (presentation.content.items.length === 0) {
        errors.push({
          path: 'content.items',
          message: 'DetailSection must contain at least one metric item',
          code: 'DETAIL_SECTION_METRIC_ITEMS_REQUIRED',
        });
      }

      break;
    }

    case 'callout': {
      if (!presentation.content.callout.title.trim()) {
        errors.push({
          path: 'content.callout.title',
          message: 'Callout title is required',
          code: 'DETAIL_SECTION_CALLOUT_TITLE_REQUIRED',
        });
      }

      break;
    }

    case 'custom-block': {
      if (!presentation.content.blockKey.trim()) {
        errors.push({
          path: 'content.blockKey',
          message: 'custom-block requires a blockKey',
          code: 'DETAIL_SECTION_CUSTOM_BLOCK_KEY_REQUIRED',
        });
      }

      break;
    }

    default:
      break;
  }

  return errors;
}
