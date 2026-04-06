import { describe, it, expect } from 'vitest';
import { validateCardListPresentation } from './validate-card-list-presentation';
import { validateDataGridPresentation } from './validate-data-grid-presentation';
import { validateDetailSectionPresentation } from './validate-detail-section-presentation';
import { validateFieldValuePresentation } from './validate-field-value-presentation';
import { validateFormFieldPresentation } from './validate-form-field-presentation';
import { validateFormSectionPresentation } from './validate-form-section-presentation';
import { validateListPagePresentation } from './validate-list-page-presentation';
import { validatePageHeaderPresentation } from './validate-page-header-presentation';
import { validatePaginationPresentation } from './validate-pagination-presentation';
import { validateTabsPresentation } from './validate-tabs-presentation';
import type { CardListPresentation } from '../../contract/cardList/CardListPresentation';
import type { DataGridPresentation } from '../../contract/data-grid/DataGridPresentationSchema';
import type { DetailSectionPresentation } from '../../contract/detail-section/DetailSectionPresentationSchema';
import type { FieldValuePresentation } from '../../contract/field-value/FieldValuePresentationSchema';
import type { FormFieldPresentation } from '../../contract/form-field/FormFieldPresentationSchema';
import type { FormSectionPresentation } from '../../contract/form-section/FormSectionPresentationSchema';
import type { ListPagePresentation } from '../../contract/list-page/ListPagePresentationSchema';
import type { PageHeaderPresentation } from '../../contract/page-header/PageHeaderPresentationSchema';
import type { PaginationPresentation } from '../../contract/pagination/PaginationPresentationSchema';
import type { TabsPresentation } from '../../contract/tabs/TabsPresentationSchema';

// ── CardList ──────────────────────────────────────────────────────────────────

function validCardList(overrides: Partial<CardListPresentation> = {}): CardListPresentation {
  return {
    type: 'card-list',
    card: {
      titleField: 'name',
      badge: { field: 'status' },
    },
    ...overrides,
  } as CardListPresentation;
}

describe('validateCardListPresentation', () => {
  it('returns no errors for valid presentation', () => {
    expect(validateCardListPresentation(validCardList())).toEqual([]);
  });

  it('CARD_LIST_TITLE_FIELD_REQUIRED when titleField is blank', () => {
    const errors = validateCardListPresentation(validCardList({ card: { titleField: '', badge: { field: 'status' } } }));
    expect(errors.some((e) => e.code === 'CARD_LIST_TITLE_FIELD_REQUIRED')).toBe(true);
  });

  it('CARD_LIST_SUPPORTING_CONTENT_REQUIRED when no badge, fields, or metrics', () => {
    const errors = validateCardListPresentation(validCardList({ card: { titleField: 'name' } }));
    expect(errors.some((e) => e.code === 'CARD_LIST_SUPPORTING_CONTENT_REQUIRED')).toBe(true);
  });

  it('CARD_LIST_DUPLICATE_FIELD_KEY for duplicate field keys', () => {
    const card = {
      titleField: 'name',
      badge: { field: 'status' },
      fields: [
        { key: 'a', label: 'A', field: 'a' },
        { key: 'a', label: 'A2', field: 'a2' },
      ],
    };
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_DUPLICATE_FIELD_KEY')).toBe(true);
  });

  it('CARD_LIST_DUPLICATE_METRIC_KEY for duplicate metric keys', () => {
    const card = {
      titleField: 'name',
      badge: { field: 'status' },
      metrics: [
        { key: 'm', label: 'M', field: 'count' },
        { key: 'm', label: 'M2', field: 'count2' },
      ],
    };
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_DUPLICATE_METRIC_KEY')).toBe(true);
  });

  it('CARD_LIST_TOO_MANY_ACTIONS when more than 2 actions', () => {
    const card = {
      titleField: 'name',
      badge: { field: 'status' },
      actions: [
        { key: 'a1', label: 'A1', actionKey: 'act1' },
        { key: 'a2', label: 'A2', actionKey: 'act2' },
        { key: 'a3', label: 'A3', actionKey: 'act3' },
      ],
    };
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_TOO_MANY_ACTIONS')).toBe(true);
  });

  it('CARD_LIST_DUPLICATE_ACTION_KEY for duplicate action keys', () => {
    const card = {
      titleField: 'name',
      badge: { field: 'status' },
      actions: [
        { key: 'dup', label: 'A', actionKey: 'act1' },
        { key: 'dup', label: 'B', actionKey: 'act2' },
      ],
    };
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_DUPLICATE_ACTION_KEY')).toBe(true);
  });

  it('CARD_LIST_ACTION_TARGET_REQUIRED when action missing actionKey and href', () => {
    const card = {
      titleField: 'name',
      badge: { field: 'status' },
      actions: [{ key: 'a1', label: 'A1' }],
    } as never;
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_ACTION_TARGET_REQUIRED')).toBe(true);
  });

  it('CARD_LIST_ACTION_TARGET_CONFLICT when action has both actionKey and href', () => {
    const card = {
      titleField: 'name',
      badge: { field: 'status' },
      actions: [{ key: 'a1', label: 'A1', actionKey: 'act', href: '/path' }],
    } as never;
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_ACTION_TARGET_CONFLICT')).toBe(true);
  });

  it('CARD_LIST_FIELD_LABEL_REQUIRED when field label is blank', () => {
    const card = {
      titleField: 'name',
      badge: { field: 'status' },
      fields: [{ key: 'f', label: '  ', field: 'x' }],
    } as never;
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_FIELD_LABEL_REQUIRED')).toBe(true);
  });

  it('CARD_LIST_FIELD_PATH_REQUIRED when field path is blank', () => {
    const card = {
      titleField: 'name',
      badge: { field: 'status' },
      fields: [{ key: 'f', label: 'F', field: '  ' }],
    } as never;
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_FIELD_PATH_REQUIRED')).toBe(true);
  });

  it('CARD_LIST_METRIC_LABEL_REQUIRED when metric label is blank', () => {
    const card = {
      titleField: 'name',
      badge: { field: 'status' },
      metrics: [{ key: 'm', label: '  ', field: 'count' }],
    } as never;
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_METRIC_LABEL_REQUIRED')).toBe(true);
  });

  it('CARD_LIST_METRIC_PATH_REQUIRED when metric field is blank', () => {
    const card = {
      titleField: 'name',
      badge: { field: 'status' },
      metrics: [{ key: 'm', label: 'M', field: '  ' }],
    } as never;
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_METRIC_PATH_REQUIRED')).toBe(true);
  });

  it('no error when no badge but fields present (branches coverage)', () => {
    const card = { titleField: 'name', fields: [{ key: 'f', label: 'F', field: 'f' }] } as never;
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_SUPPORTING_CONTENT_REQUIRED')).toBe(false);
  });

  it('no error when no badge but metrics present (branches coverage)', () => {
    const card = { titleField: 'name', metrics: [{ key: 'm', label: 'M', field: 'm' }] } as never;
    const errors = validateCardListPresentation(validCardList({ card }));
    expect(errors.some((e) => e.code === 'CARD_LIST_SUPPORTING_CONTENT_REQUIRED')).toBe(false);
  });
});

// ── DataGrid ──────────────────────────────────────────────────────────────────

function validDataGrid(overrides: Partial<DataGridPresentation> = {}): DataGridPresentation {
  return {
    type: 'data-grid',
    columns: [{ key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } }],
    ...overrides,
  } as DataGridPresentation;
}

describe('validateDataGridPresentation', () => {
  it('returns no errors for valid presentation', () => {
    expect(validateDataGridPresentation(validDataGrid())).toEqual([]);
  });

  it('DUPLICATE_COLUMN_KEY for duplicate column keys', () => {
    const errors = validateDataGridPresentation(
      validDataGrid({
        columns: [
          { key: 'dup', label: 'A', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } } as never,
          { key: 'dup', label: 'B', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } } as never,
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'DUPLICATE_COLUMN_KEY')).toBe(true);
  });

  it('NO_VISIBLE_COLUMNS when all columns are hidden', () => {
    const errors = validateDataGridPresentation(
      validDataGrid({
        columns: [{ key: 'name', label: 'Name', field: 'name', type: 'link', hidden: true, linkTarget: { type: 'detail-page' } } as never],
      }),
    );
    expect(errors.some((e) => e.code === 'NO_VISIBLE_COLUMNS')).toBe(true);
  });

  it('MISSING_VISIBLE_LINK_COLUMN when no visible link column', () => {
    // Bypass schema type — pass typed data directly to the semantic validator
    const data: DataGridPresentation = {
      type: 'data-grid',
      columns: [{ key: 'name', label: 'Name', field: 'name', type: 'text' } as never],
    };
    const errors = validateDataGridPresentation(data);
    expect(errors.some((e) => e.code === 'MISSING_VISIBLE_LINK_COLUMN')).toBe(true);
  });

  it('MULTIPLE_ACTIONS_COLUMNS when more than one actions column', () => {
    const errors = validateDataGridPresentation(
      validDataGrid({
        columns: [
          { key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } } as never,
          { key: 'a1', label: 'Actions 1', type: 'actions' } as never,
          { key: 'a2', label: 'Actions 2', type: 'actions' } as never,
        ],
        rowActions: [{ key: 'edit', label: 'Edit', actionKey: 'edit' }],
      }),
    );
    expect(errors.some((e) => e.code === 'MULTIPLE_ACTIONS_COLUMNS')).toBe(true);
  });

  it('MISSING_ROW_ACTIONS when actions column exists but rowActions is empty', () => {
    const errors = validateDataGridPresentation(
      validDataGrid({
        columns: [
          { key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } } as never,
          { key: 'actions', label: 'Actions', type: 'actions' } as never,
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'MISSING_ROW_ACTIONS')).toBe(true);
  });

  it('MISSING_ROW_ACTIONS when actions column exists and rowActions is an empty array', () => {
    const errors = validateDataGridPresentation(
      validDataGrid({
        columns: [
          { key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } } as never,
          { key: 'actions', label: 'Actions', type: 'actions' } as never,
        ],
        rowActions: [],
      }),
    );
    expect(errors.some((e) => e.code === 'MISSING_ROW_ACTIONS')).toBe(true);
  });

  it('DUPLICATE_ROW_ACTION_KEY for duplicate row action keys', () => {
    const errors = validateDataGridPresentation(
      validDataGrid({
        rowActions: [
          { key: 'dup', label: 'A', actionKey: 'act1' },
          { key: 'dup', label: 'B', actionKey: 'act2' },
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'DUPLICATE_ROW_ACTION_KEY')).toBe(true);
  });

  it('UNSUPPORTED_SORTING_MODE when sorting mode is not single', () => {
    const errors = validateDataGridPresentation(
      validDataGrid({ sorting: { enabled: true, mode: 'multi' as never } }),
    );
    expect(errors.some((e) => e.code === 'UNSUPPORTED_SORTING_MODE')).toBe(true);
  });

  it('UNSUPPORTED_SELECTION_MODE when selection mode is not page', () => {
    const errors = validateDataGridPresentation(
      validDataGrid({ selection: { enabled: true, mode: 'all' as never } }),
    );
    expect(errors.some((e) => e.code === 'UNSUPPORTED_SELECTION_MODE')).toBe(true);
  });
});

// ── DetailSection ─────────────────────────────────────────────────────────────

function validDetailSection(overrides: Partial<DetailSectionPresentation> = {}): DetailSectionPresentation {
  return {
    type: 'detail-section',
    title: 'Details',
    content: {
      mode: 'field-list',
      items: [{ key: 'name', label: 'Name', field: 'name', valueType: 'text' }],
    },
    ...overrides,
  } as DetailSectionPresentation;
}

describe('validateDetailSectionPresentation', () => {
  it('returns no errors for valid presentation', () => {
    expect(validateDetailSectionPresentation(validDetailSection())).toEqual([]);
  });

  it('DETAIL_SECTION_TITLE_REQUIRED when title is blank', () => {
    const errors = validateDetailSectionPresentation(validDetailSection({ title: '  ' }));
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_TITLE_REQUIRED')).toBe(true);
  });

  it('DETAIL_SECTION_TOO_MANY_ACTIONS when more than 2 actions', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({
        actions: [
          { key: 'a1', label: 'A1', actionKey: 'act1' },
          { key: 'a2', label: 'A2', actionKey: 'act2' },
          { key: 'a3', label: 'A3', actionKey: 'act3' },
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_TOO_MANY_ACTIONS')).toBe(true);
  });

  it('DETAIL_SECTION_DUPLICATE_ACTION_KEY for duplicate action keys', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({
        actions: [
          { key: 'dup', label: 'A', actionKey: 'act1' },
          { key: 'dup', label: 'B', actionKey: 'act2' },
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_DUPLICATE_ACTION_KEY')).toBe(true);
  });

  it('DETAIL_SECTION_ACTION_TARGET_REQUIRED when action lacks target', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({ actions: [{ key: 'a1', label: 'A1' } as never] }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_ACTION_TARGET_REQUIRED')).toBe(true);
  });

  it('DETAIL_SECTION_ACTION_TARGET_CONFLICT when action has both actionKey and href', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({
        actions: [{ key: 'a1', label: 'A1', actionKey: 'act', href: '/path' } as never],
      }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_ACTION_TARGET_CONFLICT')).toBe(true);
  });

  it('DETAIL_SECTION_DUPLICATE_FIELD_ITEM_KEY for duplicate field-list item keys', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({
        content: {
          mode: 'field-list',
          items: [
            { key: 'dup', label: 'A', field: 'a', valueType: 'text' },
            { key: 'dup', label: 'B', field: 'b', valueType: 'text' },
          ],
        },
      }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_DUPLICATE_FIELD_ITEM_KEY')).toBe(true);
  });

  it('DETAIL_SECTION_FIELD_ITEMS_REQUIRED for empty field-list', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({ content: { mode: 'field-list', items: [] } }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_FIELD_ITEMS_REQUIRED')).toBe(true);
  });

  it('returns no errors for field-grid content', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({
        content: {
          mode: 'field-grid',
          items: [{ key: 'name', label: 'Name', field: 'name', valueType: 'text' }],
        },
      }),
    );
    expect(errors).toEqual([]);
  });

  it('DETAIL_SECTION_DUPLICATE_METRIC_ITEM_KEY for duplicate metric-list item keys', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({
        content: {
          mode: 'metric-list',
          items: [
            { key: 'dup', label: 'A', field: 'a' },
            { key: 'dup', label: 'B', field: 'b' },
          ],
        },
      }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_DUPLICATE_METRIC_ITEM_KEY')).toBe(true);
  });

  it('DETAIL_SECTION_METRIC_ITEMS_REQUIRED for empty metric-list', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({ content: { mode: 'metric-list', items: [] } }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_METRIC_ITEMS_REQUIRED')).toBe(true);
  });

  it('DETAIL_SECTION_CALLOUT_TITLE_REQUIRED for blank callout title', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({ content: { mode: 'callout', callout: { title: '  ' } } }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_CALLOUT_TITLE_REQUIRED')).toBe(true);
  });

  it('returns no errors for valid callout content', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({ content: { mode: 'callout', callout: { title: 'Warning' } } }),
    );
    expect(errors).toEqual([]);
  });

  it('DETAIL_SECTION_CUSTOM_BLOCK_KEY_REQUIRED for blank blockKey', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({ content: { mode: 'custom-block', blockKey: '  ' } }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_CUSTOM_BLOCK_KEY_REQUIRED')).toBe(true);
  });

  it('returns no errors for valid custom-block content', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({ content: { mode: 'custom-block', blockKey: 'my-block' } }),
    );
    expect(errors).toEqual([]);
  });

  it('DETAIL_SECTION_INVALID_GRID_COLUMNS for field-grid with invalid columns count', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({
        content: {
          mode: 'field-grid',
          items: [{ key: 'name', label: 'Name', field: 'name', valueType: 'text' }],
          columns: 4 as never,
        },
      }),
    );
    expect(errors.some((e) => e.code === 'DETAIL_SECTION_INVALID_GRID_COLUMNS')).toBe(true);
  });

  it('returns no errors for unknown content mode (default branch)', () => {
    const errors = validateDetailSectionPresentation(
      validDetailSection({ content: { mode: 'unknown' as never } }),
    );
    expect(errors.some((e) => e.path === 'title')).toBe(false);
  });
});

// ── FieldValue ────────────────────────────────────────────────────────────────

function validFieldValue(overrides: Partial<FieldValuePresentation> = {}): FieldValuePresentation {
  return {
    type: 'field-value',
    valueType: 'text',
    ...overrides,
  } as FieldValuePresentation;
}

describe('validateFieldValuePresentation', () => {
  it('returns no errors for valid text field', () => {
    expect(validateFieldValuePresentation(validFieldValue())).toEqual([]);
  });

  it('FIELD_VALUE_INVALID_TONE_TYPE when tone used with text type', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ tone: 'info' }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_INVALID_TONE_TYPE')).toBe(true);
  });

  it('no tone error when tone used with badge type', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ valueType: 'badge', tone: 'info' }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_INVALID_TONE_TYPE')).toBe(false);
  });

  it('FIELD_VALUE_LINK_CONFIG_NOT_ALLOWED when link config on non-link type', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ link: {} }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_LINK_CONFIG_NOT_ALLOWED')).toBe(true);
  });

  it('FIELD_VALUE_LINK_CONFIG_REQUIRED when link type has no config', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ valueType: 'link' }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_LINK_CONFIG_REQUIRED')).toBe(true);
  });

  it('no error for link type with link config', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ valueType: 'link', link: {} }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_LINK_CONFIG_REQUIRED')).toBe(false);
  });

  it('FIELD_VALUE_INVALID_CURRENCY_FORMAT when currency format on non-currency type', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ format: { currency: 'USD' } }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_INVALID_CURRENCY_FORMAT')).toBe(true);
  });

  it('FIELD_VALUE_INVALID_DATE_STYLE when dateStyle on non-date type', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ format: { dateStyle: 'short' } }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_INVALID_DATE_STYLE')).toBe(true);
  });

  it('FIELD_VALUE_INVALID_DATETIME_STYLE when datetimeStyle on non-datetime type', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ format: { datetimeStyle: 'short' } }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_INVALID_DATETIME_STYLE')).toBe(true);
  });

  it('FIELD_VALUE_TOOLTIP_WITHOUT_TRUNCATE when tooltip=true but no truncate', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ tooltip: true }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_TOOLTIP_WITHOUT_TRUNCATE')).toBe(true);
  });

  it('no tooltip error when tooltip=true and truncate=true', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ tooltip: true, truncate: true }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_TOOLTIP_WITHOUT_TRUNCATE')).toBe(false);
  });

  it('FIELD_VALUE_EMPTY_LABEL_BLANK when emptyLabel is blank', () => {
    const errors = validateFieldValuePresentation(validFieldValue({ emptyLabel: '  ' }));
    expect(errors.some((e) => e.code === 'FIELD_VALUE_EMPTY_LABEL_BLANK')).toBe(true);
  });
});

// ── FormField ─────────────────────────────────────────────────────────────────

function validFormField(overrides: Partial<FormFieldPresentation> = {}): FormFieldPresentation {
  return {
    type: 'form-field',
    key: 'email',
    variant: 'standard',
    control: 'text',
    label: 'Email',
    ...overrides,
  } as FormFieldPresentation;
}

describe('validateFormFieldPresentation', () => {
  it('returns no errors for valid standard field', () => {
    expect(validateFormFieldPresentation(validFormField())).toEqual([]);
  });

  it('FORM_FIELD_KEY_REQUIRED when key is blank', () => {
    const errors = validateFormFieldPresentation(validFormField({ key: '  ' }));
    expect(errors.some((e) => e.code === 'FORM_FIELD_KEY_REQUIRED')).toBe(true);
  });

  it('FORM_FIELD_MESSAGE_TEXT_REQUIRED when message has blank text', () => {
    const errors = validateFormFieldPresentation(validFormField({ message: { tone: 'error', text: '  ' } }));
    expect(errors.some((e) => e.code === 'FORM_FIELD_MESSAGE_TEXT_REQUIRED')).toBe(true);
  });

  it('FORM_FIELD_HELP_TEXT_BLANK when helpText is blank', () => {
    const errors = validateFormFieldPresentation(validFormField({ helpText: '  ' }));
    expect(errors.some((e) => e.code === 'FORM_FIELD_HELP_TEXT_BLANK')).toBe(true);
  });

  it('FORM_FIELD_SMALL_TIP_BLANK when smallTip is blank', () => {
    const errors = validateFormFieldPresentation(validFormField({ smallTip: '  ' }));
    expect(errors.some((e) => e.code === 'FORM_FIELD_SMALL_TIP_BLANK')).toBe(true);
  });

  it('FORM_FIELD_STANDARD_LABEL_REQUIRED when standard label is blank', () => {
    const errors = validateFormFieldPresentation(validFormField({ label: '  ' }));
    expect(errors.some((e) => e.code === 'FORM_FIELD_STANDARD_LABEL_REQUIRED')).toBe(true);
  });

  it('FORM_FIELD_SELECT_OPTIONS_REQUIRED when select control has no options', () => {
    const errors = validateFormFieldPresentation(validFormField({ control: 'select' }));
    expect(errors.some((e) => e.code === 'FORM_FIELD_SELECT_OPTIONS_REQUIRED')).toBe(true);
  });

  it('FORM_FIELD_SELECT_OPTIONS_REQUIRED when select control has empty options array', () => {
    const errors = validateFormFieldPresentation(validFormField({ control: 'select', options: [] }));
    expect(errors.some((e) => e.code === 'FORM_FIELD_SELECT_OPTIONS_REQUIRED')).toBe(true);
  });

  it('FORM_FIELD_OPTIONS_NOT_ALLOWED when non-select control has options', () => {
    const errors = validateFormFieldPresentation(
      validFormField({ options: [{ key: 'a', label: 'A', value: 'a' }] }),
    );
    expect(errors.some((e) => e.code === 'FORM_FIELD_OPTIONS_NOT_ALLOWED')).toBe(true);
  });

  it('FORM_FIELD_CHECKBOX_LABEL_REQUIRED when checkbox label is blank', () => {
    const field = {
      type: 'form-field',
      key: 'agree',
      variant: 'checkbox',
      label: '  ',
    } as FormFieldPresentation;
    const errors = validateFormFieldPresentation(field);
    expect(errors.some((e) => e.code === 'FORM_FIELD_CHECKBOX_LABEL_REQUIRED')).toBe(true);
  });

  it('FORM_FIELD_CHOICE_GROUP_LEGEND_REQUIRED when choice-group legend is blank', () => {
    const field = {
      type: 'form-field',
      key: 'size',
      variant: 'choice-group',
      legend: '  ',
      options: [{ key: 'a', label: 'A', value: 'a' }],
    } as FormFieldPresentation;
    const errors = validateFormFieldPresentation(field);
    expect(errors.some((e) => e.code === 'FORM_FIELD_CHOICE_GROUP_LEGEND_REQUIRED')).toBe(true);
  });

  it('FORM_FIELD_CHOICE_GROUP_OPTIONS_REQUIRED when choice-group has no options', () => {
    const field = {
      type: 'form-field',
      key: 'size',
      variant: 'choice-group',
      legend: 'Size',
      options: [],
    } as FormFieldPresentation;
    const errors = validateFormFieldPresentation(field);
    expect(errors.some((e) => e.code === 'FORM_FIELD_CHOICE_GROUP_OPTIONS_REQUIRED')).toBe(true);
  });

  it('FORM_FIELD_DUPLICATE_OPTION_KEY for duplicate option keys in choice-group', () => {
    const field = {
      type: 'form-field',
      key: 'size',
      variant: 'choice-group',
      legend: 'Size',
      options: [
        { key: 'dup', label: 'A', value: 'a' },
        { key: 'dup', label: 'B', value: 'b' },
      ],
    } as FormFieldPresentation;
    const errors = validateFormFieldPresentation(field);
    expect(errors.some((e) => e.code === 'FORM_FIELD_DUPLICATE_OPTION_KEY')).toBe(true);
  });

  it('FORM_FIELD_DUPLICATE_OPTION_VALUE for duplicate option values', () => {
    const field = {
      type: 'form-field',
      key: 'size',
      variant: 'choice-group',
      legend: 'Size',
      options: [
        { key: 'a', label: 'A', value: 'dup' },
        { key: 'b', label: 'B', value: 'dup' },
      ],
    } as FormFieldPresentation;
    const errors = validateFormFieldPresentation(field);
    expect(errors.some((e) => e.code === 'FORM_FIELD_DUPLICATE_OPTION_VALUE')).toBe(true);
  });

  it('FORM_FIELD_OPTION_LABEL_REQUIRED when option label is blank', () => {
    const field = {
      type: 'form-field',
      key: 'size',
      variant: 'choice-group',
      legend: 'Size',
      options: [{ key: 'a', label: '  ', value: 'a' }],
    } as FormFieldPresentation;
    const errors = validateFormFieldPresentation(field);
    expect(errors.some((e) => e.code === 'FORM_FIELD_OPTION_LABEL_REQUIRED')).toBe(true);
  });

  it('FORM_FIELD_OPTION_VALUE_REQUIRED when option value is blank', () => {
    const field = {
      type: 'form-field',
      key: 'size',
      variant: 'choice-group',
      legend: 'Size',
      options: [{ key: 'a', label: 'A', value: '  ' }],
    } as FormFieldPresentation;
    const errors = validateFormFieldPresentation(field);
    expect(errors.some((e) => e.code === 'FORM_FIELD_OPTION_VALUE_REQUIRED')).toBe(true);
  });
});

// ── FormSection ───────────────────────────────────────────────────────────────

function validFormSection(overrides: Partial<FormSectionPresentation> = {}): FormSectionPresentation {
  return {
    type: 'form-section',
    key: 'details',
    title: 'Details',
    fields: [
      {
        type: 'form-field',
        key: 'name',
        variant: 'standard',
        control: 'text',
        label: 'Name',
      } as never,
    ],
    ...overrides,
  } as FormSectionPresentation;
}

describe('validateFormSectionPresentation', () => {
  it('returns no errors for valid presentation', () => {
    expect(validateFormSectionPresentation(validFormSection())).toEqual([]);
  });

  it('FORM_SECTION_KEY_REQUIRED when key is blank', () => {
    const errors = validateFormSectionPresentation(validFormSection({ key: '  ' }));
    expect(errors.some((e) => e.code === 'FORM_SECTION_KEY_REQUIRED')).toBe(true);
  });

  it('FORM_SECTION_TITLE_REQUIRED when title is blank', () => {
    const errors = validateFormSectionPresentation(validFormSection({ title: '  ' }));
    expect(errors.some((e) => e.code === 'FORM_SECTION_TITLE_REQUIRED')).toBe(true);
  });

  it('FORM_SECTION_DESCRIPTION_BLANK when description is blank', () => {
    const errors = validateFormSectionPresentation(validFormSection({ description: '  ' }));
    expect(errors.some((e) => e.code === 'FORM_SECTION_DESCRIPTION_BLANK')).toBe(true);
  });

  it('FORM_SECTION_DEFAULT_EXPANDED_WITHOUT_COLLAPSIBLE when defaultExpanded set without collapsible', () => {
    const errors = validateFormSectionPresentation(validFormSection({ defaultExpanded: true }));
    expect(errors.some((e) => e.code === 'FORM_SECTION_DEFAULT_EXPANDED_WITHOUT_COLLAPSIBLE')).toBe(true);
  });

  it('no defaultExpanded error when collapsible=true', () => {
    const errors = validateFormSectionPresentation(
      validFormSection({ collapsible: true, defaultExpanded: true }),
    );
    expect(errors.some((e) => e.code === 'FORM_SECTION_DEFAULT_EXPANDED_WITHOUT_COLLAPSIBLE')).toBe(false);
  });

  it('FORM_SECTION_DUPLICATE_FIELD_KEY for duplicate field keys', () => {
    const field = { type: 'form-field', key: 'dup', variant: 'standard', control: 'text', label: 'Name' } as never;
    const errors = validateFormSectionPresentation(validFormSection({ fields: [field, field] }));
    expect(errors.some((e) => e.code === 'FORM_SECTION_DUPLICATE_FIELD_KEY')).toBe(true);
  });

  it('FORM_SECTION_LAYOUT_WITH_TEXTAREA when two-column layout with textarea', () => {
    const textareaField = {
      type: 'form-field',
      key: 'notes',
      variant: 'standard',
      control: 'textarea',
      label: 'Notes',
    } as never;
    const errors = validateFormSectionPresentation(
      validFormSection({ layout: 'two-column', fields: [textareaField] }),
    );
    expect(errors.some((e) => e.code === 'FORM_SECTION_LAYOUT_WITH_TEXTAREA')).toBe(true);
  });

  it('FORM_SECTION_TOO_MANY_ACTIONS when more than 2 actions', () => {
    const errors = validateFormSectionPresentation(
      validFormSection({
        actions: [
          { key: 'a1', label: 'A1', actionKey: 'act1' },
          { key: 'a2', label: 'A2', actionKey: 'act2' },
          { key: 'a3', label: 'A3', actionKey: 'act3' },
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'FORM_SECTION_TOO_MANY_ACTIONS')).toBe(true);
  });

  it('FORM_SECTION_DUPLICATE_ACTION_KEY for duplicate action keys', () => {
    const errors = validateFormSectionPresentation(
      validFormSection({
        actions: [
          { key: 'dup', label: 'A', actionKey: 'act1' },
          { key: 'dup', label: 'B', actionKey: 'act2' },
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'FORM_SECTION_DUPLICATE_ACTION_KEY')).toBe(true);
  });

  it('FORM_SECTION_ACTION_LABEL_REQUIRED when action label is blank', () => {
    const errors = validateFormSectionPresentation(
      validFormSection({ actions: [{ key: 'a1', label: '  ', actionKey: 'act1' }] }),
    );
    expect(errors.some((e) => e.code === 'FORM_SECTION_ACTION_LABEL_REQUIRED')).toBe(true);
  });

  it('FORM_SECTION_ACTION_TARGET_REQUIRED when action lacks target', () => {
    const errors = validateFormSectionPresentation(
      validFormSection({ actions: [{ key: 'a1', label: 'A' } as never] }),
    );
    expect(errors.some((e) => e.code === 'FORM_SECTION_ACTION_TARGET_REQUIRED')).toBe(true);
  });

  it('FORM_SECTION_ACTION_TARGET_CONFLICT when action has both actionKey and href', () => {
    const errors = validateFormSectionPresentation(
      validFormSection({ actions: [{ key: 'a1', label: 'A', actionKey: 'act', href: '/path' } as never] }),
    );
    expect(errors.some((e) => e.code === 'FORM_SECTION_ACTION_TARGET_CONFLICT')).toBe(true);
  });

  it('FORM_SECTION_READONLY_DISABLED_CONFLICT when both readonly and disabled are true', () => {
    const errors = validateFormSectionPresentation(validFormSection({ readonly: true, disabled: true }));
    expect(errors.some((e) => e.code === 'FORM_SECTION_READONLY_DISABLED_CONFLICT')).toBe(true);
  });

  it('no error for two-column layout with text field only (no textarea)', () => {
    const errors = validateFormSectionPresentation(validFormSection({ layout: 'two-column' }));
    expect(errors.some((e) => e.code === 'FORM_SECTION_LAYOUT_WITH_TEXTAREA')).toBe(false);
  });
});

// ── ListPage ──────────────────────────────────────────────────────────────────

function validListPage(overrides: Partial<ListPagePresentation> = {}): ListPagePresentation {
  return {
    type: 'list-page',
    renderer: {
      mode: 'data-grid',
      presentation: {
        type: 'data-grid',
        columns: [{ key: 'name', label: 'Name', type: 'link' }],
      },
    },
    ...overrides,
  } as ListPagePresentation;
}

describe('validateListPagePresentation', () => {
  it('returns no errors for valid presentation', () => {
    expect(validateListPagePresentation(validListPage())).toEqual([]);
  });

  it('LIST_PAGE_INVALID_HEADER_TYPE when header type is wrong', () => {
    const errors = validateListPagePresentation(validListPage({ header: { type: 'other' } as never }));
    expect(errors.some((e) => e.code === 'LIST_PAGE_INVALID_HEADER_TYPE')).toBe(true);
  });

  it('LIST_PAGE_INVALID_NAVIGATION_TYPE when navigation type is wrong', () => {
    const errors = validateListPagePresentation(validListPage({ navigation: { type: 'other' } as never }));
    expect(errors.some((e) => e.code === 'LIST_PAGE_INVALID_NAVIGATION_TYPE')).toBe(true);
  });

  it('LIST_PAGE_INVALID_PAGINATION_TYPE when pagination type is wrong', () => {
    const errors = validateListPagePresentation(validListPage({ pagination: { type: 'other' } as never }));
    expect(errors.some((e) => e.code === 'LIST_PAGE_INVALID_PAGINATION_TYPE')).toBe(true);
  });

  it('LIST_PAGE_DUPLICATE_FILTER_KEY for duplicate filter keys', () => {
    const errors = validateListPagePresentation(
      validListPage({
        controls: {
          filters: {
            items: [
              { key: 'dup', label: 'A' },
              { key: 'dup', label: 'B' },
            ],
          },
        },
      }),
    );
    expect(errors.some((e) => e.code === 'LIST_PAGE_DUPLICATE_FILTER_KEY')).toBe(true);
  });

  it('LIST_PAGE_SEARCH_PLACEHOLDER_WITHOUT_SEARCH when placeholder set but search hidden', () => {
    const errors = validateListPagePresentation(
      validListPage({ controls: { search: { visible: false, placeholder: 'Search...' } } }),
    );
    expect(errors.some((e) => e.code === 'LIST_PAGE_SEARCH_PLACEHOLDER_WITHOUT_SEARCH')).toBe(true);
  });

  it('LIST_PAGE_FILTER_MODE_WITHOUT_FILTERS when mode set but filters hidden', () => {
    const errors = validateListPagePresentation(
      validListPage({ controls: { filters: { visible: false, mode: 'drawer' } } }),
    );
    expect(errors.some((e) => e.code === 'LIST_PAGE_FILTER_MODE_WITHOUT_FILTERS')).toBe(true);
  });

  it('LIST_PAGE_SORTING_MODE_WITHOUT_SORTING when mode set but sorting hidden', () => {
    const errors = validateListPagePresentation(
      validListPage({ controls: { sorting: { visible: false, mode: 'summary' } } }),
    );
    expect(errors.some((e) => e.code === 'LIST_PAGE_SORTING_MODE_WITHOUT_SORTING')).toBe(true);
  });

  it('LIST_PAGE_BULK_ACTIONS_DISABLED when visibleWhenSelection is false', () => {
    const errors = validateListPagePresentation(
      validListPage({ controls: { bulkActions: { visibleWhenSelection: false } } }),
    );
    expect(errors.some((e) => e.code === 'LIST_PAGE_BULK_ACTIONS_DISABLED')).toBe(true);
  });

  it('LIST_PAGE_EMPTY_STATE_TITLE_REQUIRED when emptyState title is blank', () => {
    const errors = validateListPagePresentation(validListPage({ emptyState: { title: '  ' } }));
    expect(errors.some((e) => e.code === 'LIST_PAGE_EMPTY_STATE_TITLE_REQUIRED')).toBe(true);
  });

  it('LIST_PAGE_RENDERER_TYPE_MISMATCH when data-grid mode but non-data-grid presentation', () => {
    const errors = validateListPagePresentation(
      validListPage({
        renderer: {
          mode: 'data-grid',
          presentation: { type: 'card-list', card: { titleField: 'name', badge: { field: 's' } } } as never,
        },
      }),
    );
    expect(errors.some((e) => e.code === 'LIST_PAGE_RENDERER_TYPE_MISMATCH')).toBe(true);
  });

  it('LIST_PAGE_RENDERER_TYPE_MISMATCH when card-list mode but non-card-list presentation', () => {
    const errors = validateListPagePresentation(
      validListPage({
        renderer: {
          mode: 'card-list',
          presentation: { type: 'data-grid', columns: [] } as never,
        },
      }),
    );
    expect(errors.some((e) => e.code === 'LIST_PAGE_RENDERER_TYPE_MISMATCH')).toBe(true);
  });
});

// ── PageHeader ────────────────────────────────────────────────────────────────

function validPageHeader(overrides: Partial<PageHeaderPresentation> = {}): PageHeaderPresentation {
  return {
    type: 'page-header',
    title: 'Customers',
    ...overrides,
  } as PageHeaderPresentation;
}

describe('validatePageHeaderPresentation', () => {
  it('returns no errors for valid presentation', () => {
    expect(validatePageHeaderPresentation(validPageHeader())).toEqual([]);
  });

  it('PAGE_HEADER_TITLE_REQUIRED when title is blank', () => {
    const errors = validatePageHeaderPresentation(validPageHeader({ title: '  ' }));
    expect(errors.some((e) => e.code === 'PAGE_HEADER_TITLE_REQUIRED')).toBe(true);
  });

  it('PAGE_HEADER_DUPLICATE_BREADCRUMB_KEY for duplicate breadcrumb keys', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({
        breadcrumbs: [
          { key: 'dup', label: 'A' },
          { key: 'dup', label: 'B' },
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_DUPLICATE_BREADCRUMB_KEY')).toBe(true);
  });

  it('PAGE_HEADER_DUPLICATE_META_KEY for duplicate meta keys', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({
        meta: [
          { type: 'text', key: 'dup', label: 'A' },
          { type: 'text', key: 'dup', label: 'B' },
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_DUPLICATE_META_KEY')).toBe(true);
  });

  it('PAGE_HEADER_DUPLICATE_SECONDARY_ACTION_KEY for duplicate secondary action keys', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({
        secondaryActions: [
          { key: 'dup', label: 'A', actionKey: 'act1' },
          { key: 'dup', label: 'B', actionKey: 'act2' },
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_DUPLICATE_SECONDARY_ACTION_KEY')).toBe(true);
  });

  it('PAGE_HEADER_ACTION_KEY_CONFLICT when primary action key conflicts with secondary', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({
        primaryAction: { key: 'shared', label: 'Primary', actionKey: 'act' },
        secondaryActions: [{ key: 'shared', label: 'Secondary', actionKey: 'act2' }],
      }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_ACTION_KEY_CONFLICT')).toBe(true);
  });

  it('PAGE_HEADER_TOO_MANY_SECONDARY_ACTIONS when more than 3', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({
        secondaryActions: [
          { key: 'a1', label: 'A1', actionKey: 'act1' },
          { key: 'a2', label: 'A2', actionKey: 'act2' },
          { key: 'a3', label: 'A3', actionKey: 'act3' },
          { key: 'a4', label: 'A4', actionKey: 'act4' },
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_TOO_MANY_SECONDARY_ACTIONS')).toBe(true);
  });

  it('PAGE_HEADER_INVALID_PRIMARY_ACTION_INTENT when primary action has neutral intent', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({
        primaryAction: { key: 'act', label: 'Act', actionKey: 'action', intent: 'neutral' },
      }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_INVALID_PRIMARY_ACTION_INTENT')).toBe(true);
  });

  it('PAGE_HEADER_ACTION_LABEL_REQUIRED when primary action label is blank', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({
        primaryAction: { key: 'act', label: '  ', actionKey: 'action' },
      }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_ACTION_LABEL_REQUIRED')).toBe(true);
  });

  it('PAGE_HEADER_ACTION_TARGET_REQUIRED when primary action lacks target', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({ primaryAction: { key: 'act', label: 'Act' } as never }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_ACTION_TARGET_REQUIRED')).toBe(true);
  });

  it('PAGE_HEADER_ACTION_TARGET_CONFLICT when primary action has both actionKey and href', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({
        primaryAction: { key: 'act', label: 'Act', actionKey: 'action', href: '/path' } as never,
      }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_ACTION_TARGET_CONFLICT')).toBe(true);
  });

  it('PAGE_HEADER_META_LABEL_REQUIRED when meta item label is blank', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({ meta: [{ type: 'text', key: 'm1', label: '  ' }] }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_META_LABEL_REQUIRED')).toBe(true);
  });

  it('PAGE_HEADER_BREADCRUMB_LABEL_REQUIRED when breadcrumb with href has blank label', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({ breadcrumbs: [{ key: 'b1', label: '  ', href: '/customers' }] }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_BREADCRUMB_LABEL_REQUIRED')).toBe(true);
  });

  it('PAGE_HEADER_ACTION_LABEL_REQUIRED when secondary action label is blank', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({ secondaryActions: [{ key: 'a', label: '  ', actionKey: 'act' }] }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_ACTION_LABEL_REQUIRED')).toBe(true);
  });

  it('PAGE_HEADER_ACTION_TARGET_REQUIRED when secondary action lacks target', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({ secondaryActions: [{ key: 'a', label: 'A' } as never] }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_ACTION_TARGET_REQUIRED')).toBe(true);
  });

  it('PAGE_HEADER_ACTION_TARGET_CONFLICT when secondary action has both actionKey and href', () => {
    const errors = validatePageHeaderPresentation(
      validPageHeader({ secondaryActions: [{ key: 'a', label: 'A', actionKey: 'act', href: '/path' } as never] }),
    );
    expect(errors.some((e) => e.code === 'PAGE_HEADER_ACTION_TARGET_CONFLICT')).toBe(true);
  });
});

// ── Pagination ────────────────────────────────────────────────────────────────

function validPagination(overrides: Partial<PaginationPresentation> = {}): PaginationPresentation {
  return {
    type: 'pagination',
    ...overrides,
  } as PaginationPresentation;
}

describe('validatePaginationPresentation', () => {
  it('returns no errors for valid presentation', () => {
    expect(validatePaginationPresentation(validPagination())).toEqual([]);
  });

  it('PAGINATION_RANGE_REQUIRED when range.visible is false', () => {
    const errors = validatePaginationPresentation(validPagination({ range: { visible: false } }));
    expect(errors.some((e) => e.code === 'PAGINATION_RANGE_REQUIRED')).toBe(true);
  });

  it('PAGINATION_PREVIOUS_REQUIRED when showPrevious is false', () => {
    const errors = validatePaginationPresentation(
      validPagination({ navigation: { showPrevious: false } }),
    );
    expect(errors.some((e) => e.code === 'PAGINATION_PREVIOUS_REQUIRED')).toBe(true);
  });

  it('PAGINATION_NEXT_REQUIRED when showNext is false', () => {
    const errors = validatePaginationPresentation(
      validPagination({ navigation: { showNext: false } }),
    );
    expect(errors.some((e) => e.code === 'PAGINATION_NEXT_REQUIRED')).toBe(true);
  });

  it('PAGINATION_PAGE_SIZE_OPTIONS_TOO_SMALL when only one option', () => {
    const errors = validatePaginationPresentation(
      validPagination({ pageSize: { visible: true, options: [10] } }),
    );
    expect(errors.some((e) => e.code === 'PAGINATION_PAGE_SIZE_OPTIONS_TOO_SMALL')).toBe(true);
  });

  it('no page size error when two options provided', () => {
    const errors = validatePaginationPresentation(
      validPagination({ pageSize: { options: [10, 25] } }),
    );
    expect(errors.some((e) => e.code === 'PAGINATION_PAGE_SIZE_OPTIONS_TOO_SMALL')).toBe(false);
  });

  it('PAGINATION_PAGE_SIZE_OPTIONS_NOT_SORTED when options are descending', () => {
    const errors = validatePaginationPresentation(
      validPagination({ pageSize: { options: [25, 10] } }),
    );
    expect(errors.some((e) => e.code === 'PAGINATION_PAGE_SIZE_OPTIONS_NOT_SORTED')).toBe(true);
  });

  it('PAGINATION_UNSUPPORTED_PAGE_LIST_MODE when pageListMode is not compact-ellipsis', () => {
    const errors = validatePaginationPresentation(
      validPagination({ navigation: { pageListMode: 'custom' as never } }),
    );
    expect(errors.some((e) => e.code === 'PAGINATION_UNSUPPORTED_PAGE_LIST_MODE')).toBe(true);
  });
});

// ── Tabs ──────────────────────────────────────────────────────────────────────

function validTabs(overrides: Partial<TabsPresentation> = {}): TabsPresentation {
  return {
    type: 'tabs',
    items: [{ key: 'overview', label: 'Overview', href: '/overview' }],
    ...overrides,
  } as TabsPresentation;
}

describe('validateTabsPresentation', () => {
  it('returns no errors for valid presentation', () => {
    expect(validateTabsPresentation(validTabs())).toEqual([]);
  });

  it('TABS_ITEMS_REQUIRED when items is empty', () => {
    const errors = validateTabsPresentation(validTabs({ items: [] }));
    expect(errors.some((e) => e.code === 'TABS_ITEMS_REQUIRED')).toBe(true);
  });

  it('TABS_DUPLICATE_ITEM_KEY for duplicate tab keys', () => {
    const errors = validateTabsPresentation(
      validTabs({
        items: [
          { key: 'dup', label: 'A', href: '/a' },
          { key: 'dup', label: 'B', href: '/b' },
        ],
      }),
    );
    expect(errors.some((e) => e.code === 'TABS_DUPLICATE_ITEM_KEY')).toBe(true);
  });

  it('TABS_INVALID_ACTIVE_KEY when activeKey does not match any item', () => {
    const errors = validateTabsPresentation(validTabs({ activeKey: 'nonexistent' }));
    expect(errors.some((e) => e.code === 'TABS_INVALID_ACTIVE_KEY')).toBe(true);
  });

  it('TABS_ITEM_TARGET_REQUIRED when item lacks href and actionKey', () => {
    const errors = validateTabsPresentation(
      validTabs({ items: [{ key: 'tab', label: 'Tab' } as never] }),
    );
    expect(errors.some((e) => e.code === 'TABS_ITEM_TARGET_REQUIRED')).toBe(true);
  });

  it('TABS_ITEM_TARGET_CONFLICT when item has both href and actionKey', () => {
    const errors = validateTabsPresentation(
      validTabs({ items: [{ key: 'tab', label: 'Tab', href: '/tab', actionKey: 'tab' }] }),
    );
    expect(errors.some((e) => e.code === 'TABS_ITEM_TARGET_CONFLICT')).toBe(true);
  });

  it('TABS_ITEM_LABEL_REQUIRED when item label is blank', () => {
    const errors = validateTabsPresentation(
      validTabs({ items: [{ key: 'tab', label: '  ', href: '/tab' }] }),
    );
    expect(errors.some((e) => e.code === 'TABS_ITEM_LABEL_REQUIRED')).toBe(true);
  });

  it('TABS_ITEM_INVALID_COUNT when item count is negative', () => {
    const errors = validateTabsPresentation(
      validTabs({ items: [{ key: 'tab', label: 'Tab', href: '/tab', count: -1 }] }),
    );
    expect(errors.some((e) => e.code === 'TABS_ITEM_INVALID_COUNT')).toBe(true);
  });

  it('TABS_INVALID_OVERFLOW_MODE when overflow mode is not scroll or menu', () => {
    const errors = validateTabsPresentation(
      validTabs({ overflow: { mode: 'other' as never } }),
    );
    expect(errors.some((e) => e.code === 'TABS_INVALID_OVERFLOW_MODE')).toBe(true);
  });
});
