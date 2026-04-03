import type { FormFieldOption, FormFieldPresentation } from '../../contract/form-field/FormFieldPresentationSchema';
import type { PresentationValidationError } from '../types';

export function validateFormFieldPresentation(presentation: FormFieldPresentation): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  // Key should stay meaningful for stable id/telemetry wiring.
  if (!presentation.key.trim()) {
    errors.push({
      path: 'key',
      message: 'FormField key is required',
      code: 'FORM_FIELD_KEY_REQUIRED',
    });
  }

  // Message text should stay explicit when present.
  if (presentation.message && !presentation.message.text.trim()) {
    errors.push({
      path: 'message.text',
      message: 'Field message text is required when message is present',
      code: 'FORM_FIELD_MESSAGE_TEXT_REQUIRED',
    });
  }

  if (presentation.helpText !== undefined && !presentation.helpText.trim()) {
    errors.push({
      path: 'helpText',
      message: 'helpText must not be blank',
      code: 'FORM_FIELD_HELP_TEXT_BLANK',
    });
  }

  if (presentation.smallTip !== undefined && !presentation.smallTip.trim()) {
    errors.push({
      path: 'smallTip',
      message: 'smallTip must not be blank',
      code: 'FORM_FIELD_SMALL_TIP_BLANK',
    });
  }

  if (presentation.variant === 'standard') {
    if (!presentation.label.trim()) {
      errors.push({
        path: 'label',
        message: 'Standard field label is required',
        code: 'FORM_FIELD_STANDARD_LABEL_REQUIRED',
      });
    }

    if (presentation.control === 'select' && (!presentation.options || presentation.options.length === 0)) {
      errors.push({
        path: 'options',
        message: 'Standard select field requires at least one option',
        code: 'FORM_FIELD_SELECT_OPTIONS_REQUIRED',
      });
    }

    if (presentation.control !== 'select' && presentation.options) {
      errors.push({
        path: 'options',
        message: 'options are only allowed when control is "select"',
        code: 'FORM_FIELD_OPTIONS_NOT_ALLOWED',
      });
    }
  }

  if (presentation.variant === 'checkbox' && !presentation.label.trim()) {
    errors.push({
      path: 'label',
      message: 'Checkbox field label is required',
      code: 'FORM_FIELD_CHECKBOX_LABEL_REQUIRED',
    });
  }

  if (presentation.variant === 'choice-group') {
    if (!presentation.legend.trim()) {
      errors.push({
        path: 'legend',
        message: 'Choice-group legend is required',
        code: 'FORM_FIELD_CHOICE_GROUP_LEGEND_REQUIRED',
      });
    }

    if (presentation.options.length === 0) {
      errors.push({
        path: 'options',
        message: 'Choice-group requires at least one option',
        code: 'FORM_FIELD_CHOICE_GROUP_OPTIONS_REQUIRED',
      });
    }
  }

  const options: FormFieldOption[] | undefined =
    presentation.variant === 'standard' || presentation.variant === 'choice-group' ? presentation.options : undefined;

  if (options) {
    const optionKeys = options.map((option) => option.key);
    const duplicateOptionKeys = optionKeys.filter((key, index) => optionKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateOptionKeys)) {
      errors.push({
        path: 'options',
        message: `Duplicate option key "${key}"`,
        code: 'FORM_FIELD_DUPLICATE_OPTION_KEY',
      });
    }

    const optionValues = options.map((option) => option.value);
    const duplicateOptionValues = optionValues.filter(
      (optionValue, index) => optionValues.indexOf(optionValue) !== index,
    );

    for (const optionValue of new Set(duplicateOptionValues)) {
      errors.push({
        path: 'options',
        message: `Duplicate option value "${optionValue}"`,
        code: 'FORM_FIELD_DUPLICATE_OPTION_VALUE',
      });
    }

    for (const [index, option] of options.entries()) {
      if (!option.label.trim()) {
        errors.push({
          path: `options.${index}.label`,
          message: 'Option label is required',
          code: 'FORM_FIELD_OPTION_LABEL_REQUIRED',
        });
      }

      if (!option.value.trim()) {
        errors.push({
          path: `options.${index}.value`,
          message: 'Option value is required',
          code: 'FORM_FIELD_OPTION_VALUE_REQUIRED',
        });
      }
    }
  }

  return errors;
}
