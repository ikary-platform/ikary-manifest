import type { IkaryFormPresentation } from '../../contract/form/IkaryFormPresentationSchema';
import type { PresentationValidationError } from '../types';

export function validateIkaryFormPresentation(presentation: IkaryFormPresentation): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  if (!presentation.key.trim()) {
    errors.push({
      path: 'key',
      message: 'Form key is required',
      code: 'FORM_KEY_REQUIRED',
    });
  }

  if (!presentation.title.trim()) {
    errors.push({
      path: 'title',
      message: 'Form title is required',
      code: 'FORM_TITLE_REQUIRED',
    });
  }

  if (presentation.description !== undefined && !presentation.description.trim()) {
    errors.push({
      path: 'description',
      message: 'description must not be blank',
      code: 'FORM_DESCRIPTION_BLANK',
    });
  }

  const sectionKeys = presentation.sections.map((section) => section.key);
  const duplicateSectionKeys = sectionKeys.filter((key, index) => sectionKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateSectionKeys)) {
    errors.push({
      path: 'sections',
      message: `Duplicate section key "${key}"`,
      code: 'FORM_DUPLICATE_SECTION_KEY',
    });
  }

  const mode = presentation.mode ?? 'draft-and-commit';
  if (mode === 'commit-only' && presentation.autosave?.enabled === true) {
    errors.push({
      path: 'autosave.enabled',
      message: 'autosave cannot be enabled when mode is "commit-only"',
      code: 'FORM_AUTOSAVE_NOT_ALLOWED',
    });
  }

  if (presentation.autosave?.debounceMs !== undefined && presentation.autosave.enabled !== true) {
    errors.push({
      path: 'autosave.debounceMs',
      message: 'autosave.debounceMs requires autosave.enabled=true',
      code: 'FORM_AUTOSAVE_DEBOUNCE_WITHOUT_ENABLED',
    });
  }

  if (presentation.readonly === true && presentation.disabled === true) {
    errors.push({
      path: 'disabled',
      message: 'Use either readonly or disabled at form level, not both',
      code: 'FORM_READONLY_DISABLED_CONFLICT',
    });
  }

  if (presentation.sections.length === 0) {
    errors.push({
      path: 'sections',
      message: 'Form must define at least one section',
      code: 'FORM_SECTIONS_REQUIRED',
    });
  }

  return errors;
}

// Backward-compatible alias for existing imports.
export const validateFormPresentation = validateIkaryFormPresentation;
