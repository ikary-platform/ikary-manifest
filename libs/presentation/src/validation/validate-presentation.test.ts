import { describe, it, expect } from 'vitest';
import { validatePresentation } from './validate-presentation';

const validDataGrid = {
  type: 'data-grid',
  columns: [{ key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } }],
};

const validPagination = {
  type: 'pagination',
};

const validPageHeader = {
  type: 'page-header',
  title: 'Customers',
};

const validDetailSection = {
  type: 'detail-section',
  title: 'Details',
  content: {
    mode: 'field-list',
    items: [{ key: 'name', label: 'Name', field: 'name', valueType: 'text' }],
  },
};

const validFormField = {
  type: 'form-field',
  key: 'email',
  variant: 'standard',
  control: 'text',
  label: 'Email',
};

const validFormSection = {
  type: 'form-section',
  key: 'details',
  title: 'Details',
  fields: [validFormField],
};

const validForm = {
  type: 'form',
  key: 'my-form',
  title: 'My Form',
  sections: [validFormSection],
};

describe('validatePresentation', () => {
  it('returns ok:false when input is not an object', () => {
    const result = validatePresentation(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('returns ok:false when type is missing', () => {
    const result = validatePresentation({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('returns ok:false for unsupported presentation type', () => {
    const result = validatePresentation({ type: 'unknown-type' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('UNSUPPORTED_PRESENTATION_TYPE');
  });

  describe('data-grid', () => {
    it('returns ok:true for valid data-grid', () => {
      const result = validatePresentation(validDataGrid);
      expect(result.ok).toBe(true);
    });

    it('returns structural error for invalid data-grid', () => {
      const result = validatePresentation({ type: 'data-grid' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
    });

    it('returns structural error for data-grid missing link column', () => {
      // The schema superRefine catches this before semantic validators run
      const result = validatePresentation({
        type: 'data-grid',
        columns: [{ key: 'name', label: 'Name', type: 'text' }],
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
    });
  });

  describe('pagination', () => {
    it('returns ok:true for valid pagination', () => {
      const result = validatePresentation(validPagination);
      expect(result.ok).toBe(true);
    });

    it('returns semantic error for invalid pagination', () => {
      const result = validatePresentation({ type: 'pagination', range: { visible: false } });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.some((e) => e.code === 'PAGINATION_RANGE_REQUIRED')).toBe(true);
    });
  });

  describe('page-header', () => {
    it('returns ok:true for valid page-header', () => {
      const result = validatePresentation(validPageHeader);
      expect(result.ok).toBe(true);
    });

    it('returns structural error for page-header without title', () => {
      const result = validatePresentation({ type: 'page-header' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
    });

    it('returns structural error when primaryAction key conflicts with secondaryAction key', () => {
      const result = validatePresentation({
        ...validPageHeader,
        primaryAction: { key: 'shared', label: 'Primary', actionKey: 'act1' },
        secondaryActions: [{ key: 'shared', label: 'Secondary', href: '/path' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for page-header with more than 3 secondary actions', () => {
      const result = validatePresentation({
        ...validPageHeader,
        secondaryActions: [
          { key: 'a1', label: 'A1', actionKey: 'act1' },
          { key: 'a2', label: 'A2', actionKey: 'act2' },
          { key: 'a3', label: 'A3', actionKey: 'act3' },
          { key: 'a4', label: 'A4', actionKey: 'act4' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for page-header action with both actionKey and href', () => {
      const result = validatePresentation({
        ...validPageHeader,
        primaryAction: { key: 'a', label: 'Act', actionKey: 'act', href: '/path' },
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for page-header action without actionKey or href', () => {
      const result = validatePresentation({
        ...validPageHeader,
        primaryAction: { key: 'a', label: 'Act' },
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for page-header with duplicate breadcrumb keys', () => {
      const result = validatePresentation({
        ...validPageHeader,
        breadcrumbs: [{ key: 'dup', label: 'A' }, { key: 'dup', label: 'B' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for page-header with duplicate meta keys', () => {
      const result = validatePresentation({
        ...validPageHeader,
        meta: [
          { type: 'text', key: 'dup', label: 'A' },
          { type: 'text', key: 'dup', label: 'B' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for page-header with duplicate secondary action keys', () => {
      const result = validatePresentation({
        ...validPageHeader,
        secondaryActions: [
          { key: 'dup', label: 'A', actionKey: 'act1' },
          { key: 'dup', label: 'B', actionKey: 'act2' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns semantic error for page-header with blank title', () => {
      // '  ' passes z.string().min(1) but fails semantic trim check
      const result = validatePresentation({ type: 'page-header', title: '  ' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.some((e) => e.code === 'PAGE_HEADER_TITLE_REQUIRED')).toBe(true);
    });
  });

  describe('detail-section', () => {
    it('returns ok:true for valid detail-section', () => {
      const result = validatePresentation(validDetailSection);
      expect(result.ok).toBe(true);
    });

    it('returns structural error for invalid detail-section', () => {
      const result = validatePresentation({ type: 'detail-section' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
    });

    it('returns semantic error for detail-section with blank title', () => {
      // '  ' passes z.string().min(1) but fails semantic trim check
      const result = validatePresentation({ ...validDetailSection, title: '  ' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.some((e) => e.code === 'DETAIL_SECTION_TITLE_REQUIRED')).toBe(true);
    });

    it('returns structural error for field-grid with invalid columns count', () => {
      const result = validatePresentation({
        type: 'detail-section',
        title: 'Details',
        content: {
          mode: 'field-grid',
          items: [{ key: 'name', label: 'Name', field: 'name', valueType: 'text' }],
          columns: 4 as never,
        },
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for detail-section with duplicate field-list item keys', () => {
      const result = validatePresentation({
        type: 'detail-section',
        title: 'Details',
        content: {
          mode: 'field-list',
          items: [
            { key: 'dup', label: 'A', field: 'a', valueType: 'text' },
            { key: 'dup', label: 'B', field: 'b', valueType: 'text' },
          ],
        },
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for detail-section with duplicate metric-list item keys', () => {
      const result = validatePresentation({
        type: 'detail-section',
        title: 'Details',
        content: {
          mode: 'metric-list',
          items: [
            { key: 'dup', label: 'A', field: 'a' },
            { key: 'dup', label: 'B', field: 'b' },
          ],
        },
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for detail-section action without actionKey or href', () => {
      const result = validatePresentation({
        ...validDetailSection,
        actions: [{ key: 'a', label: 'Act' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for detail-section action with both actionKey and href', () => {
      const result = validatePresentation({
        ...validDetailSection,
        actions: [{ key: 'a', label: 'Act', actionKey: 'act', href: '/path' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for detail-section with duplicate action keys', () => {
      const result = validatePresentation({
        ...validDetailSection,
        actions: [
          { key: 'dup', label: 'A', actionKey: 'act1' },
          { key: 'dup', label: 'B', actionKey: 'act2' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for detail-section with more than 2 actions', () => {
      const result = validatePresentation({
        ...validDetailSection,
        actions: [
          { key: 'a1', label: 'A1', actionKey: 'act1' },
          { key: 'a2', label: 'A2', actionKey: 'act2' },
          { key: 'a3', label: 'A3', actionKey: 'act3' },
        ],
      });
      expect(result.ok).toBe(false);
    });
  });

  describe('form-field', () => {
    it('returns ok:true for valid form-field', () => {
      const result = validatePresentation(validFormField);
      expect(result.ok).toBe(true);
    });

    it('returns structural error for invalid form-field', () => {
      const result = validatePresentation({ type: 'form-field' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
    });
  });

  describe('form-section', () => {
    it('returns ok:true for valid form-section', () => {
      const result = validatePresentation(validFormSection);
      expect(result.ok).toBe(true);
    });

    it('returns structural error for invalid form-section', () => {
      const result = validatePresentation({ type: 'form-section' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
    });
  });

  describe('form', () => {
    it('returns ok:true for valid form', () => {
      const result = validatePresentation(validForm);
      expect(result.ok).toBe(true);
    });

    it('returns structural error for invalid form', () => {
      const result = validatePresentation({ type: 'form' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
    });

    it('returns semantic error for form with blank key', () => {
      const result = validatePresentation({ ...validForm, key: '  ' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.some((e) => e.code === 'FORM_KEY_REQUIRED')).toBe(true);
    });

    it('returns structural error for form with duplicate section keys', () => {
      const result = validatePresentation({
        ...validForm,
        sections: [validFormSection, { ...validFormSection, title: 'Details 2' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for autosave conflict with commit-only mode', () => {
      const result = validatePresentation({ ...validForm, mode: 'commit-only', autosave: { enabled: true } });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for autosave.debounceMs without enabled', () => {
      const result = validatePresentation({ ...validForm, autosave: { debounceMs: 500 } });
      expect(result.ok).toBe(false);
    });
  });

  describe('data-grid - additional schema branches', () => {
    it('returns structural error for data-grid with duplicate column keys', () => {
      const result = validatePresentation({
        type: 'data-grid',
        columns: [
          { key: 'dup', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } },
          { key: 'dup', label: 'Status', field: 'status', type: 'text' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for data-grid with all columns hidden', () => {
      const result = validatePresentation({
        type: 'data-grid',
        columns: [
          { key: 'name', label: 'Name', field: 'name', type: 'text', hidden: true },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for data-grid with duplicate row action keys', () => {
      const result = validatePresentation({
        type: 'data-grid',
        columns: [
          { key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } },
          { key: 'act', label: 'Actions', type: 'actions' },
        ],
        rowActions: [
          { key: 'dup', label: 'A', actionKey: 'act1' },
          { key: 'dup', label: 'B', actionKey: 'act2' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for data-grid with two actions columns', () => {
      const result = validatePresentation({
        type: 'data-grid',
        columns: [
          { key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } },
          { key: 'act1', label: 'Actions 1', type: 'actions' },
          { key: 'act2', label: 'Actions 2', type: 'actions' },
        ],
        rowActions: [{ key: 'edit', label: 'Edit', actionKey: 'edit' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for data-grid actions column without rowActions', () => {
      const result = validatePresentation({
        type: 'data-grid',
        columns: [
          { key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } },
          { key: 'act', label: 'Actions', type: 'actions' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for actions column with field set', () => {
      const result = validatePresentation({
        type: 'data-grid',
        columns: [
          { key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } },
          { key: 'act', label: 'Actions', type: 'actions', field: 'x' },
        ],
        rowActions: [{ key: 'edit', label: 'Edit', actionKey: 'edit' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for link column without linkTarget', () => {
      const result = validatePresentation({
        type: 'data-grid',
        columns: [{ key: 'name', label: 'Name', field: 'name', type: 'link' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for sortField without sortable', () => {
      const result = validatePresentation({
        type: 'data-grid',
        columns: [{
          key: 'name', label: 'Name', field: 'name', type: 'link',
          linkTarget: { type: 'detail-page' }, sortField: 'name_sort',
        }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for linkTarget on non-link column', () => {
      const result = validatePresentation({
        type: 'data-grid',
        columns: [
          { key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } },
          { key: 'status', label: 'Status', field: 'status', type: 'text', linkTarget: { type: 'detail-page' } },
        ],
      });
      expect(result.ok).toBe(false);
    });
  });

  describe('form-field - additional schema branches', () => {
    it('returns structural error for select field without options', () => {
      const result = validatePresentation({ ...validFormField, control: 'select' });
      expect(result.ok).toBe(false);
    });

    it('returns semantic error for form-field with blank key', () => {
      // '  ' (spaces) passes z.string().min(1) length check but fails semantic trim check
      const result = validatePresentation({ ...validFormField, key: '  ' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.some((e) => e.code === 'FORM_FIELD_KEY_REQUIRED')).toBe(true);
    });

    it('returns structural error for select field with duplicate option keys', () => {
      const result = validatePresentation({
        ...validFormField,
        control: 'select',
        options: [
          { key: 'dup', label: 'A', value: 'a' },
          { key: 'dup', label: 'B', value: 'b' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for select field with duplicate option values', () => {
      const result = validatePresentation({
        ...validFormField,
        control: 'select',
        options: [
          { key: 'a', label: 'A', value: 'dup' },
          { key: 'b', label: 'B', value: 'dup' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for non-select field with options', () => {
      const result = validatePresentation({
        ...validFormField,
        control: 'text',
        options: [{ key: 'a', label: 'A', value: 'a' }],
      });
      expect(result.ok).toBe(false);
    });
  });

  describe('form-section - additional schema branches', () => {
    it('returns structural error for defaultExpanded without collapsible', () => {
      const result = validatePresentation({ ...validFormSection, defaultExpanded: true });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for two-column layout with relation field', () => {
      const result = validatePresentation({
        ...validFormSection,
        layout: 'two-column',
        fields: [{
          type: 'form-field',
          key: 'rel',
          variant: 'relation',
          label: 'Customer',
          createPolicy: 'create',
          targetEntity: 'customer',
        }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for two-column layout with textarea field', () => {
      const result = validatePresentation({
        ...validFormSection,
        layout: 'two-column',
        fields: [{ type: 'form-field', key: 'notes', variant: 'standard', control: 'textarea', label: 'Notes' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error when section has more than 2 actions', () => {
      const result = validatePresentation({
        ...validFormSection,
        actions: [
          { key: 'a1', label: 'A1', actionKey: 'act1' },
          { key: 'a2', label: 'A2', actionKey: 'act2' },
          { key: 'a3', label: 'A3', actionKey: 'act3' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for form-section with duplicate field keys', () => {
      const field = { type: 'form-field', key: 'dup', variant: 'standard', control: 'text', label: 'Name' };
      const result = validatePresentation({
        ...validFormSection,
        fields: [field, { ...field, label: 'Name 2' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for form-section with duplicate action keys', () => {
      const result = validatePresentation({
        ...validFormSection,
        actions: [
          { key: 'dup', label: 'A', actionKey: 'act1' },
          { key: 'dup', label: 'B', actionKey: 'act2' },
        ],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for form-section action with both actionKey and href', () => {
      const result = validatePresentation({
        ...validFormSection,
        actions: [{ key: 'a', label: 'A', actionKey: 'act', href: '/path' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for form-section action without actionKey or href', () => {
      const result = validatePresentation({
        ...validFormSection,
        actions: [{ key: 'a', label: 'Act' }],
      });
      expect(result.ok).toBe(false);
    });

    it('returns semantic error for form-section with blank key', () => {
      const result = validatePresentation({ ...validFormSection, key: '  ' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.some((e) => e.code === 'FORM_SECTION_KEY_REQUIRED')).toBe(true);
    });
  });

  describe('pagination - additional schema branches', () => {
    it('returns structural error for duplicate pageSize options', () => {
      const result = validatePresentation({ type: 'pagination', pageSize: { options: [10, 10, 25] } });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for maxVisiblePages without showPageList', () => {
      const result = validatePresentation({
        type: 'pagination',
        navigation: { showPageList: false, maxVisiblePages: 7 },
      });
      expect(result.ok).toBe(false);
    });

    it('returns structural error for even maxVisiblePages', () => {
      const result = validatePresentation({ type: 'pagination', navigation: { maxVisiblePages: 6 } });
      expect(result.ok).toBe(false);
    });
  });
});
