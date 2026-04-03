import type { CardListPresentation } from '../../contract/cardList/CardListPresentation';
import type { PresentationValidationError } from '../types';

export function validateCardListPresentation(presentation: CardListPresentation): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  // The card must stay meaningful
  if (!presentation.card.titleField || presentation.card.titleField.trim().length === 0) {
    errors.push({
      path: 'card.titleField',
      message: 'CardList card titleField is required',
      code: 'CARD_LIST_TITLE_FIELD_REQUIRED',
    });
  }

  // The card should expose at least one supporting content surface
  if (
    !presentation.card.badge &&
    !(presentation.card.fields && presentation.card.fields.length > 0) &&
    !(presentation.card.metrics && presentation.card.metrics.length > 0)
  ) {
    errors.push({
      path: 'card',
      message: 'CardList card should define at least one of badge, fields, or metrics',
      code: 'CARD_LIST_SUPPORTING_CONTENT_REQUIRED',
    });
  }

  // Field keys must be unique
  const fieldKeys = (presentation.card.fields ?? []).map((item) => item.key);
  const duplicateFieldKeys = fieldKeys.filter((key, index) => fieldKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateFieldKeys)) {
    errors.push({
      path: 'card.fields',
      message: `Duplicate field key "${key}"`,
      code: 'CARD_LIST_DUPLICATE_FIELD_KEY',
    });
  }

  // Metric keys must be unique
  const metricKeys = (presentation.card.metrics ?? []).map((item) => item.key);
  const duplicateMetricKeys = metricKeys.filter((key, index) => metricKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateMetricKeys)) {
    errors.push({
      path: 'card.metrics',
      message: `Duplicate metric key "${key}"`,
      code: 'CARD_LIST_DUPLICATE_METRIC_KEY',
    });
  }

  // Action keys must be unique
  const actionKeys = (presentation.card.actions ?? []).map((action) => action.key);
  const duplicateActionKeys = actionKeys.filter((key, index) => actionKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateActionKeys)) {
    errors.push({
      path: 'card.actions',
      message: `Duplicate action key "${key}"`,
      code: 'CARD_LIST_DUPLICATE_ACTION_KEY',
    });
  }

  // Canonical V1 rule: at most 2 card actions
  if ((presentation.card.actions ?? []).length > 2) {
    errors.push({
      path: 'card.actions',
      message: 'CardList should expose at most 2 visible card actions in V1',
      code: 'CARD_LIST_TOO_MANY_ACTIONS',
    });
  }

  // Action target semantics
  for (const [index, action] of (presentation.card.actions ?? []).entries()) {
    if (!action.actionKey && !action.href) {
      errors.push({
        path: `card.actions.${index}`,
        message: 'Card action must define either actionKey or href',
        code: 'CARD_LIST_ACTION_TARGET_REQUIRED',
      });
    }

    if (action.actionKey && action.href) {
      errors.push({
        path: `card.actions.${index}`,
        message: 'Card action cannot define both actionKey and href at the same time',
        code: 'CARD_LIST_ACTION_TARGET_CONFLICT',
      });
    }
  }

  // Field item semantics
  for (const [index, field] of (presentation.card.fields ?? []).entries()) {
    if (!field.label.trim()) {
      errors.push({
        path: `card.fields.${index}.label`,
        message: 'Card field label is required',
        code: 'CARD_LIST_FIELD_LABEL_REQUIRED',
      });
    }

    if (!field.field.trim()) {
      errors.push({
        path: `card.fields.${index}.field`,
        message: 'Card field path is required',
        code: 'CARD_LIST_FIELD_PATH_REQUIRED',
      });
    }
  }

  // Metric item semantics
  for (const [index, metric] of (presentation.card.metrics ?? []).entries()) {
    if (!metric.label.trim()) {
      errors.push({
        path: `card.metrics.${index}.label`,
        message: 'Card metric label is required',
        code: 'CARD_LIST_METRIC_LABEL_REQUIRED',
      });
    }

    if (!metric.field.trim()) {
      errors.push({
        path: `card.metrics.${index}.field`,
        message: 'Card metric field path is required',
        code: 'CARD_LIST_METRIC_PATH_REQUIRED',
      });
    }
  }

  return errors;
}
