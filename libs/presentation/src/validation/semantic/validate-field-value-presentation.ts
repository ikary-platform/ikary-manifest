import type { FieldValuePresentation } from '../../contract/field-value/FieldValuePresentationSchema';
import type { PresentationValidationError } from '../types';

export function validateFieldValuePresentation(presentation: FieldValuePresentation): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  const toneTypes = new Set(['badge', 'status', 'enum']);
  const linkType = presentation.valueType === 'link';
  const currencyType = presentation.valueType === 'currency';
  const dateType = presentation.valueType === 'date';
  const dateTimeType = presentation.valueType === 'datetime';

  // Tone is only meaningful for categorical displays
  if (presentation.tone && !toneTypes.has(presentation.valueType)) {
    errors.push({
      path: 'tone',
      message: 'tone is only allowed for badge, status, or enum value types',
      code: 'FIELD_VALUE_INVALID_TONE_TYPE',
    });
  }

  // Link config belongs only to link values
  if (presentation.link && !linkType) {
    errors.push({
      path: 'link',
      message: 'link config is only allowed when valueType is "link"',
      code: 'FIELD_VALUE_LINK_CONFIG_NOT_ALLOWED',
    });
  }

  if (linkType && !presentation.link) {
    errors.push({
      path: 'link',
      message: 'link config is required when valueType is "link"',
      code: 'FIELD_VALUE_LINK_CONFIG_REQUIRED',
    });
  }

  // Format hints must match the value type
  if (presentation.format?.currency && !currencyType) {
    errors.push({
      path: 'format.currency',
      message: 'format.currency is only allowed when valueType is "currency"',
      code: 'FIELD_VALUE_INVALID_CURRENCY_FORMAT',
    });
  }

  if (presentation.format?.dateStyle && !dateType) {
    errors.push({
      path: 'format.dateStyle',
      message: 'format.dateStyle is only allowed when valueType is "date"',
      code: 'FIELD_VALUE_INVALID_DATE_STYLE',
    });
  }

  if (presentation.format?.datetimeStyle && !dateTimeType) {
    errors.push({
      path: 'format.datetimeStyle',
      message: 'format.datetimeStyle is only allowed when valueType is "datetime"',
      code: 'FIELD_VALUE_INVALID_DATETIME_STYLE',
    });
  }

  // Canonical V1 rule: tooltip is mainly useful with truncation.
  // Allowing tooltip=true without truncate=true creates unclear behavior.
  if (presentation.tooltip === true && presentation.truncate !== true) {
    errors.push({
      path: 'tooltip',
      message: 'tooltip=true should be used together with truncate=true in V1',
      code: 'FIELD_VALUE_TOOLTIP_WITHOUT_TRUNCATE',
    });
  }

  // Canonical V1 rule: emptyLabel should remain meaningful if provided
  if (presentation.emptyLabel !== undefined && presentation.emptyLabel.trim().length === 0) {
    errors.push({
      path: 'emptyLabel',
      message: 'emptyLabel must not be blank',
      code: 'FIELD_VALUE_EMPTY_LABEL_BLANK',
    });
  }

  return errors;
}
