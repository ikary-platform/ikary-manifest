/**
 * Direct schema validation tests for schemas that have no runtime validator.
 * These test the Zod schemas' safeParse directly to cover superRefine branches.
 */
import { describe, it, expect } from 'vitest';
import { FieldValuePresentationSchema } from './field-value/FieldValuePresentationSchema';
import { TabsPresentationSchema } from './tabs/TabsPresentationSchema';
import { ListPagePresentationSchema } from './list-page/ListPagePresentationSchema';
import { CardListPresentationSchema } from './cardList/CardListPresentation';
import { DashboardPagePresentationSchema } from './dashboard-page/DashboardPagePresentationSchema';

// ── FieldValue ────────────────────────────────────────────────────────────────

describe('FieldValuePresentationSchema', () => {
  const valid = { type: 'field-value', valueType: 'text' };

  it('parses valid text field', () => {
    expect(FieldValuePresentationSchema.safeParse(valid).success).toBe(true);
  });

  it('parses valid link field with link config', () => {
    const result = FieldValuePresentationSchema.safeParse({ type: 'field-value', valueType: 'link', link: {} });
    expect(result.success).toBe(true);
  });

  it('fails when valueType is missing', () => {
    expect(FieldValuePresentationSchema.safeParse({ type: 'field-value' }).success).toBe(false);
  });

  it('fails when tone used with non-categorical type', () => {
    const result = FieldValuePresentationSchema.safeParse({ ...valid, tone: 'info' });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('tone is only allowed'))).toBe(true);
  });

  it('accepts tone with badge type', () => {
    expect(
      FieldValuePresentationSchema.safeParse({ type: 'field-value', valueType: 'badge', tone: 'info' }).success,
    ).toBe(true);
  });

  it('accepts tone with status type', () => {
    expect(
      FieldValuePresentationSchema.safeParse({ type: 'field-value', valueType: 'status', tone: 'neutral' }).success,
    ).toBe(true);
  });

  it('accepts tone with enum type', () => {
    expect(
      FieldValuePresentationSchema.safeParse({ type: 'field-value', valueType: 'enum', tone: 'success' }).success,
    ).toBe(true);
  });

  it('fails when link config on non-link type', () => {
    const result = FieldValuePresentationSchema.safeParse({ ...valid, link: {} });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('link config is only allowed'))).toBe(true);
  });

  it('fails when link type has no link config', () => {
    const result = FieldValuePresentationSchema.safeParse({ type: 'field-value', valueType: 'link' });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('link config is required'))).toBe(true);
  });

  it('fails when currency format on non-currency type', () => {
    const result = FieldValuePresentationSchema.safeParse({ ...valid, format: { currency: 'USD' } });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('format.currency'))).toBe(true);
  });

  it('accepts currency format on currency type', () => {
    expect(
      FieldValuePresentationSchema.safeParse({
        type: 'field-value',
        valueType: 'currency',
        format: { currency: 'USD' },
      }).success,
    ).toBe(true);
  });

  it('fails when dateStyle on non-date type', () => {
    const result = FieldValuePresentationSchema.safeParse({ ...valid, format: { dateStyle: 'short' } });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('format.dateStyle'))).toBe(true);
  });

  it('accepts dateStyle on date type', () => {
    expect(
      FieldValuePresentationSchema.safeParse({
        type: 'field-value',
        valueType: 'date',
        format: { dateStyle: 'short' },
      }).success,
    ).toBe(true);
  });

  it('fails when datetimeStyle on non-datetime type', () => {
    const result = FieldValuePresentationSchema.safeParse({ ...valid, format: { datetimeStyle: 'short' } });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('format.datetimeStyle'))).toBe(true);
  });

  it('accepts datetimeStyle on datetime type', () => {
    expect(
      FieldValuePresentationSchema.safeParse({
        type: 'field-value',
        valueType: 'datetime',
        format: { datetimeStyle: 'short' },
      }).success,
    ).toBe(true);
  });
});

// ── Tabs ──────────────────────────────────────────────────────────────────────

describe('TabsPresentationSchema', () => {
  const validItem = { key: 'overview', label: 'Overview', href: '/overview' };
  const valid = { type: 'tabs', items: [validItem] };

  it('parses valid tabs', () => {
    expect(TabsPresentationSchema.safeParse(valid).success).toBe(true);
  });

  it('fails when items is empty', () => {
    expect(TabsPresentationSchema.safeParse({ type: 'tabs', items: [] }).success).toBe(false);
  });

  it('fails when item has no href or actionKey', () => {
    const result = TabsPresentationSchema.safeParse({
      type: 'tabs',
      items: [{ key: 'overview', label: 'Overview' }],
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('href or actionKey'))).toBe(true);
  });

  it('fails when item has both href and actionKey', () => {
    const result = TabsPresentationSchema.safeParse({
      type: 'tabs',
      items: [{ key: 'overview', label: 'Overview', href: '/overview', actionKey: 'nav' }],
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('cannot both be set'))).toBe(true);
  });

  it('fails when tab keys are duplicate', () => {
    const result = TabsPresentationSchema.safeParse({
      type: 'tabs',
      items: [
        { key: 'dup', label: 'A', href: '/a' },
        { key: 'dup', label: 'B', href: '/b' },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('duplicate tab key'))).toBe(true);
  });

  it('fails when activeKey does not reference any tab', () => {
    const result = TabsPresentationSchema.safeParse({ ...valid, activeKey: 'nonexistent' });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('does not reference'))).toBe(true);
  });

  it('parses with valid activeKey', () => {
    expect(TabsPresentationSchema.safeParse({ ...valid, activeKey: 'overview' }).success).toBe(true);
  });

  it('parses with actionKey instead of href', () => {
    expect(
      TabsPresentationSchema.safeParse({
        type: 'tabs',
        items: [{ key: 'overview', label: 'Overview', actionKey: 'navigate' }],
      }).success,
    ).toBe(true);
  });
});

// ── ListPage ──────────────────────────────────────────────────────────────────

const validListPageData = {
  type: 'list-page',
  renderer: {
    mode: 'data-grid',
    presentation: {
      type: 'data-grid',
      columns: [{ key: 'name', label: 'Name', field: 'name', type: 'link', linkTarget: { type: 'detail-page' } }],
    },
  },
};

describe('ListPagePresentationSchema', () => {
  it('parses valid list page with data-grid renderer', () => {
    expect(ListPagePresentationSchema.safeParse(validListPageData).success).toBe(true);
  });

  it('parses valid list page with card-list renderer', () => {
    const data = {
      type: 'list-page',
      renderer: {
        mode: 'card-list',
        presentation: {
          type: 'card-list',
          card: { titleField: 'name', badge: { field: 'status' } },
        },
      },
    };
    expect(ListPagePresentationSchema.safeParse(data).success).toBe(true);
  });

  it('fails when renderer is missing', () => {
    expect(ListPagePresentationSchema.safeParse({ type: 'list-page' }).success).toBe(false);
  });

  it('fails when filter keys are duplicate', () => {
    const result = ListPagePresentationSchema.safeParse({
      ...validListPageData,
      controls: {
        filters: {
          items: [
            { key: 'dup', label: 'A' },
            { key: 'dup', label: 'B' },
          ],
        },
      },
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('duplicate filter key'))).toBe(true);
  });

  it('fails when renderer mode is data-grid but presentation type is not', () => {
    const result = ListPagePresentationSchema.safeParse({
      ...validListPageData,
      renderer: {
        mode: 'data-grid',
        presentation: {
          type: 'card-list' as never,
          card: { titleField: 'name', badge: { field: 'status' } },
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('fails when header type is wrong', () => {
    const result = ListPagePresentationSchema.safeParse({
      ...validListPageData,
      header: { type: 'other' } as never,
    });
    expect(result.success).toBe(false);
  });

  it('fails when navigation type is wrong', () => {
    const result = ListPagePresentationSchema.safeParse({
      ...validListPageData,
      navigation: { type: 'other' } as never,
    });
    expect(result.success).toBe(false);
  });

  it('fails when pagination type is wrong', () => {
    const result = ListPagePresentationSchema.safeParse({
      ...validListPageData,
      pagination: { type: 'other' } as never,
    });
    expect(result.success).toBe(false);
  });

  it('parses with valid page-header', () => {
    const result = ListPagePresentationSchema.safeParse({
      ...validListPageData,
      header: { type: 'page-header', title: 'Customers' },
    });
    expect(result.success).toBe(true);
  });

  it('parses with valid tabs navigation', () => {
    const result = ListPagePresentationSchema.safeParse({
      ...validListPageData,
      navigation: {
        type: 'tabs',
        items: [{ key: 'all', label: 'All', href: '/all' }],
      },
    });
    expect(result.success).toBe(true);
  });

  it('parses with valid pagination', () => {
    const result = ListPagePresentationSchema.safeParse({
      ...validListPageData,
      pagination: { type: 'pagination' },
    });
    expect(result.success).toBe(true);
  });
});

// ── CardList ──────────────────────────────────────────────────────────────────

const validCardList = {
  type: 'card-list',
  card: { titleField: 'name', badge: { field: 'status' } },
};

describe('CardListPresentationSchema', () => {
  it('parses valid card-list', () => {
    expect(CardListPresentationSchema.safeParse(validCardList).success).toBe(true);
  });

  it('fails when card action has no actionKey or href', () => {
    const result = CardListPresentationSchema.safeParse({
      ...validCardList,
      card: { ...validCardList.card, actions: [{ key: 'a', label: 'Act' }] },
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('actionKey or href is required'))).toBe(true);
  });

  it('fails when card action has both actionKey and href', () => {
    const result = CardListPresentationSchema.safeParse({
      ...validCardList,
      card: { ...validCardList.card, actions: [{ key: 'a', label: 'Act', actionKey: 'act', href: '/path' }] },
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('cannot both be set'))).toBe(true);
  });

  it('fails when card has duplicate field keys', () => {
    const result = CardListPresentationSchema.safeParse({
      ...validCardList,
      card: {
        ...validCardList.card,
        fields: [
          { key: 'dup', label: 'A', field: 'a' },
          { key: 'dup', label: 'B', field: 'b' },
        ],
      },
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('duplicate field key'))).toBe(true);
  });

  it('fails when card has duplicate metric keys', () => {
    const result = CardListPresentationSchema.safeParse({
      ...validCardList,
      card: {
        ...validCardList.card,
        metrics: [
          { key: 'dup', label: 'A', field: 'a' },
          { key: 'dup', label: 'B', field: 'b' },
        ],
      },
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('duplicate metric key'))).toBe(true);
  });

  it('fails when card has duplicate action keys', () => {
    const result = CardListPresentationSchema.safeParse({
      ...validCardList,
      card: {
        ...validCardList.card,
        actions: [
          { key: 'dup', label: 'A', actionKey: 'act1' },
          { key: 'dup', label: 'B', actionKey: 'act2' },
        ],
      },
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('duplicate action key'))).toBe(true);
  });

  it('fails when card has more than 2 actions', () => {
    const result = CardListPresentationSchema.safeParse({
      ...validCardList,
      card: {
        ...validCardList.card,
        actions: [
          { key: 'a1', label: 'A1', actionKey: 'act1' },
          { key: 'a2', label: 'A2', actionKey: 'act2' },
          { key: 'a3', label: 'A3', actionKey: 'act3' },
        ],
      },
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('at most 2'))).toBe(true);
  });

  it('fails when card has no badge, fields, or metrics', () => {
    const result = CardListPresentationSchema.safeParse({
      type: 'card-list',
      card: { titleField: 'name' },
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('at least one of badge, fields, or metrics'))).toBe(true);
  });
});

// ── DashboardPage ─────────────────────────────────────────────────────────────

const validWidget = { key: 'revenue', title: 'Revenue', renderer: { key: 'kpi-renderer' } };

describe('DashboardPagePresentationSchema', () => {
  it('parses valid dashboard page', () => {
    expect(DashboardPagePresentationSchema.safeParse({ title: 'Overview' }).success).toBe(true);
  });

  it('fails when a widget collection has duplicate keys', () => {
    const result = DashboardPagePresentationSchema.safeParse({
      title: 'Overview',
      kpis: [
        { ...validWidget, key: 'dup' },
        { ...validWidget, key: 'dup', title: 'Revenue 2' },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('duplicate widget key'))).toBe(true);
  });

  it('fails when widget key appears in multiple zones', () => {
    const result = DashboardPagePresentationSchema.safeParse({
      title: 'Overview',
      kpis: [{ ...validWidget, key: 'shared' }],
      primaryWidgets: [{ ...validWidget, key: 'shared', title: 'Shared' }],
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes('must be unique across dashboard zones'))).toBe(true);
  });
});
