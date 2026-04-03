import { describe, it, expect } from 'vitest';
import { validateIkaryFormPresentation } from './validate-ikary-form-presentation';
import type { IkaryFormPresentation } from '../../contract/form/IkaryFormPresentationSchema';

// ── Helpers ───────────────────────────────────────────────────────────────────

function validPresentation(overrides: Partial<IkaryFormPresentation> = {}): IkaryFormPresentation {
  return {
    type: 'form',
    key: 'test-form',
    title: 'Test Form',
    sections: [
      {
        type: 'form-section',
        key: 'details',
        title: 'Details',
        layout: 'stack',
        fields: [],
      } as never,
    ],
    ...overrides,
  } as IkaryFormPresentation;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('validateIkaryFormPresentation', () => {
  it('returns no errors for a valid presentation', () => {
    expect(validateIkaryFormPresentation(validPresentation())).toEqual([]);
  });

  describe('key validation', () => {
    it('returns FORM_KEY_REQUIRED when key is empty', () => {
      const errors = validateIkaryFormPresentation(validPresentation({ key: '  ' }));
      expect(errors.some((e) => e.code === 'FORM_KEY_REQUIRED')).toBe(true);
    });
  });

  describe('title validation', () => {
    it('returns FORM_TITLE_REQUIRED when title is blank', () => {
      const errors = validateIkaryFormPresentation(validPresentation({ title: '' }));
      expect(errors.some((e) => e.code === 'FORM_TITLE_REQUIRED')).toBe(true);
    });
  });

  describe('description validation', () => {
    it('returns FORM_DESCRIPTION_BLANK when description is blank', () => {
      const errors = validateIkaryFormPresentation(validPresentation({ description: '  ' }));
      expect(errors.some((e) => e.code === 'FORM_DESCRIPTION_BLANK')).toBe(true);
    });

    it('accepts a valid non-blank description', () => {
      const errors = validateIkaryFormPresentation(validPresentation({ description: 'A description' }));
      expect(errors).toEqual([]);
    });

    it('ignores description when absent (undefined)', () => {
      const errors = validateIkaryFormPresentation(validPresentation({ description: undefined }));
      expect(errors).toEqual([]);
    });
  });

  describe('sections validation', () => {
    it('returns FORM_SECTIONS_REQUIRED when sections is empty', () => {
      const errors = validateIkaryFormPresentation(validPresentation({ sections: [] }));
      expect(errors.some((e) => e.code === 'FORM_SECTIONS_REQUIRED')).toBe(true);
    });

    it('returns FORM_DUPLICATE_SECTION_KEY for duplicate section keys', () => {
      const section = { type: 'form-section', key: 'same', title: 'S', layout: 'stack', fields: [] } as never;
      const errors = validateIkaryFormPresentation(validPresentation({ sections: [section, section] }));
      expect(errors.some((e) => e.code === 'FORM_DUPLICATE_SECTION_KEY')).toBe(true);
    });
  });

  describe('autosave validation', () => {
    it('returns FORM_AUTOSAVE_NOT_ALLOWED when mode=commit-only and autosave.enabled=true', () => {
      const errors = validateIkaryFormPresentation(
        validPresentation({ mode: 'commit-only', autosave: { enabled: true } }),
      );
      expect(errors.some((e) => e.code === 'FORM_AUTOSAVE_NOT_ALLOWED')).toBe(true);
    });

    it('returns FORM_AUTOSAVE_DEBOUNCE_WITHOUT_ENABLED when debounceMs set without enabled=true', () => {
      const errors = validateIkaryFormPresentation(validPresentation({ autosave: { debounceMs: 500 } }));
      expect(errors.some((e) => e.code === 'FORM_AUTOSAVE_DEBOUNCE_WITHOUT_ENABLED')).toBe(true);
    });

    it('accepts autosave with enabled=true and debounceMs', () => {
      const errors = validateIkaryFormPresentation(validPresentation({ autosave: { enabled: true, debounceMs: 500 } }));
      expect(errors).toEqual([]);
    });
  });

  describe('readonly/disabled conflict', () => {
    it('returns FORM_READONLY_DISABLED_CONFLICT when both readonly and disabled are true', () => {
      const errors = validateIkaryFormPresentation(validPresentation({ readonly: true, disabled: true }));
      expect(errors.some((e) => e.code === 'FORM_READONLY_DISABLED_CONFLICT')).toBe(true);
    });

    it('accepts readonly=true without disabled', () => {
      const errors = validateIkaryFormPresentation(validPresentation({ readonly: true }));
      expect(errors).toEqual([]);
    });
  });
});
