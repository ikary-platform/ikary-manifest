import type { FormSectionPresentation } from '../../contract/form-section/FormSectionPresentationSchema';
import type { PresentationValidationError } from '../types';

export function validateFormSectionPresentation(presentation: FormSectionPresentation): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  if (!presentation.key.trim()) {
    errors.push({
      path: 'key',
      message: 'FormSection key is required',
      code: 'FORM_SECTION_KEY_REQUIRED',
    });
  }

  if (!presentation.title.trim()) {
    errors.push({
      path: 'title',
      message: 'FormSection title is required',
      code: 'FORM_SECTION_TITLE_REQUIRED',
    });
  }

  if (presentation.description !== undefined && !presentation.description.trim()) {
    errors.push({
      path: 'description',
      message: 'description must not be blank',
      code: 'FORM_SECTION_DESCRIPTION_BLANK',
    });
  }

  if (presentation.defaultExpanded !== undefined && presentation.collapsible !== true) {
    errors.push({
      path: 'defaultExpanded',
      message: 'defaultExpanded is only allowed when collapsible=true',
      code: 'FORM_SECTION_DEFAULT_EXPANDED_WITHOUT_COLLAPSIBLE',
    });
  }

  const fieldKeys = presentation.fields.map((field) => field.key);
  const duplicateFieldKeys = fieldKeys.filter((key, index) => fieldKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateFieldKeys)) {
    errors.push({
      path: 'fields',
      message: `Duplicate field key "${key}"`,
      code: 'FORM_SECTION_DUPLICATE_FIELD_KEY',
    });
  }

  if (presentation.layout === 'two-column') {
    const hasTextArea = presentation.fields.some(
      (field) => field.variant === 'standard' && field.control === 'textarea',
    );

    if (hasTextArea) {
      errors.push({
        path: 'layout',
        message: 'two-column layout should not be used with textarea form fields',
        code: 'FORM_SECTION_LAYOUT_WITH_TEXTAREA',
      });
    }
  }

  if ((presentation.actions ?? []).length > 2) {
    errors.push({
      path: 'actions',
      message: 'FormSection should expose at most 2 section actions in V1',
      code: 'FORM_SECTION_TOO_MANY_ACTIONS',
    });
  }

  const actionKeys = (presentation.actions ?? []).map((action) => action.key);
  const duplicateActionKeys = actionKeys.filter((key, index) => actionKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateActionKeys)) {
    errors.push({
      path: 'actions',
      message: `Duplicate action key "${key}"`,
      code: 'FORM_SECTION_DUPLICATE_ACTION_KEY',
    });
  }

  for (const [index, action] of (presentation.actions ?? []).entries()) {
    if (!action.label.trim()) {
      errors.push({
        path: `actions.${index}.label`,
        message: 'Action label is required',
        code: 'FORM_SECTION_ACTION_LABEL_REQUIRED',
      });
    }

    if (!action.actionKey && !action.href) {
      errors.push({
        path: `actions.${index}`,
        message: 'Action must define either actionKey or href',
        code: 'FORM_SECTION_ACTION_TARGET_REQUIRED',
      });
    }

    if (action.actionKey && action.href) {
      errors.push({
        path: `actions.${index}`,
        message: 'Action cannot define both actionKey and href at the same time',
        code: 'FORM_SECTION_ACTION_TARGET_CONFLICT',
      });
    }
  }

  if (presentation.readonly === true && presentation.disabled === true) {
    errors.push({
      path: 'disabled',
      message: 'Use either readonly or disabled at section level, not both',
      code: 'FORM_SECTION_READONLY_DISABLED_CONFLICT',
    });
  }

  return errors;
}
