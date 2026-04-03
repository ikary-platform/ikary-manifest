import type { PageHeaderPresentation } from '../../contract/page-header/PageHeaderPresentationSchema';
import type { PresentationValidationError } from '../types';

export function validatePageHeaderPresentation(presentation: PageHeaderPresentation): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  // Title is structurally required by the schema, but we keep the semantic guard too
  if (!presentation.title || presentation.title.trim().length === 0) {
    errors.push({
      path: 'title',
      message: 'PageHeader title is required',
      code: 'PAGE_HEADER_TITLE_REQUIRED',
    });
  }

  // Breadcrumb keys must be unique
  const breadcrumbKeys = (presentation.breadcrumbs ?? []).map((item) => item.key);
  const duplicateBreadcrumbKeys = breadcrumbKeys.filter((key, index) => breadcrumbKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateBreadcrumbKeys)) {
    errors.push({
      path: 'breadcrumbs',
      message: `Duplicate breadcrumb key "${key}"`,
      code: 'PAGE_HEADER_DUPLICATE_BREADCRUMB_KEY',
    });
  }

  // Meta keys must be unique
  const metaKeys = (presentation.meta ?? []).map((item) => item.key);
  const duplicateMetaKeys = metaKeys.filter((key, index) => metaKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateMetaKeys)) {
    errors.push({
      path: 'meta',
      message: `Duplicate meta key "${key}"`,
      code: 'PAGE_HEADER_DUPLICATE_META_KEY',
    });
  }

  // Secondary action keys must be unique
  const secondaryActionKeys = (presentation.secondaryActions ?? []).map((action) => action.key);
  const duplicateSecondaryActionKeys = secondaryActionKeys.filter(
    (key, index) => secondaryActionKeys.indexOf(key) !== index,
  );

  for (const key of new Set(duplicateSecondaryActionKeys)) {
    errors.push({
      path: 'secondaryActions',
      message: `Duplicate secondary action key "${key}"`,
      code: 'PAGE_HEADER_DUPLICATE_SECONDARY_ACTION_KEY',
    });
  }

  // Primary action key must not collide with secondary action keys
  if (presentation.primaryAction) {
    const primaryKey = presentation.primaryAction.key;

    if ((presentation.secondaryActions ?? []).some((action) => action.key === primaryKey)) {
      errors.push({
        path: 'secondaryActions',
        message: `Secondary action key "${primaryKey}" conflicts with primary action key`,
        code: 'PAGE_HEADER_ACTION_KEY_CONFLICT',
      });
    }
  }

  // Canonical rule: at most 3 visible secondary actions before overflow handling
  if ((presentation.secondaryActions ?? []).length > 3) {
    errors.push({
      path: 'secondaryActions',
      message: 'PageHeader should expose at most 3 secondary actions before overflow handling',
      code: 'PAGE_HEADER_TOO_MANY_SECONDARY_ACTIONS',
    });
  }

  // Primary action should stay "primary".
  // In canonical usage, primary action should not be neutral.
  if (presentation.primaryAction?.intent === 'neutral') {
    errors.push({
      path: 'primaryAction.intent',
      message: 'Primary action cannot use neutral intent',
      code: 'PAGE_HEADER_INVALID_PRIMARY_ACTION_INTENT',
    });
  }

  // Breadcrumbs should stay meaningful: if href is set, label must not be empty
  for (const [index, breadcrumb] of (presentation.breadcrumbs ?? []).entries()) {
    if (breadcrumb.href && breadcrumb.label.trim().length === 0) {
      errors.push({
        path: `breadcrumbs.${index}.label`,
        message: 'Breadcrumb label is required when href is set',
        code: 'PAGE_HEADER_BREADCRUMB_LABEL_REQUIRED',
      });
    }
  }

  // Meta items must stay meaningful
  for (const [index, item] of (presentation.meta ?? []).entries()) {
    if (!item.label || item.label.trim().length === 0) {
      errors.push({
        path: `meta.${index}.label`,
        message: 'Meta item label is required',
        code: 'PAGE_HEADER_META_LABEL_REQUIRED',
      });
    }
  }

  // Actions must stay meaningful
  if (presentation.primaryAction) {
    validateAction(presentation.primaryAction, 'primaryAction', errors);
  }

  for (const [index, action] of (presentation.secondaryActions ?? []).entries()) {
    validateAction(action, `secondaryActions.${index}`, errors);
  }

  return errors;
}

function validateAction(
  action: {
    key: string;
    label: string;
    actionKey?: string;
    href?: string;
    intent?: 'default' | 'neutral' | 'danger';
  },
  path: string,
  errors: PresentationValidationError[],
): void {
  if (!action.label || action.label.trim().length === 0) {
    errors.push({
      path: `${path}.label`,
      message: 'Action label is required',
      code: 'PAGE_HEADER_ACTION_LABEL_REQUIRED',
    });
  }

  if (!action.actionKey && !action.href) {
    errors.push({
      path,
      message: 'Action must define either actionKey or href',
      code: 'PAGE_HEADER_ACTION_TARGET_REQUIRED',
    });
  }

  if (action.actionKey && action.href) {
    errors.push({
      path,
      message: 'Action cannot define both actionKey and href at the same time',
      code: 'PAGE_HEADER_ACTION_TARGET_CONFLICT',
    });
  }
}
