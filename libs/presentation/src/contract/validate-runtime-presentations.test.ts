import { describe, it, expect } from 'vitest';
import {
  validateRuntimeActivityFeedPresentation,
  parseRuntimeActivityFeedPresentation,
} from './activity-feed/validate-runtime-activity-feed-presentation';
import {
  validateRuntimeBulkCommandBarPresentation,
  parseRuntimeBulkCommandBarPresentation,
} from './bulk-command-bar/validate-runtime-bulk-command-bar-presentation';
import {
  validateRuntimeCheckboxPresentation,
  parseRuntimeCheckboxPresentation,
} from './checkbox/validate-runtime-checkbox-presentation';
import {
  validateRuntimeDashboardPagePresentation,
  parseRuntimeDashboardPagePresentation,
} from './dashboard-page/validate-runtime-dashboard-page-presentation';
import {
  validateRuntimeDateInputPresentation,
  parseRuntimeDateInputPresentation,
} from './date-input/validate-runtime-date-input-presentation';
import {
  validateRuntimeDetailItem,
  parseRuntimeDetailItem,
} from './detail-item/validation-runtime-detail-item';
import {
  validateRuntimeDetailPagePresentation,
  parseRuntimeDetailPagePresentation,
} from './detail-page/validate-runtime-detail-page-presentation';
import {
  validateRuntimeEmptyStatePresentation,
  parseRuntimeEmptyStatePresentation,
} from './empty-state/validate-runtime-empty-state-presentation';
import {
  validateRuntimeErrorStatePresentation,
  parseRuntimeErrorStatePresentation,
} from './error-state/validate-runtime-error-state-presentation';
import {
  validateRuntimeFilterBarPresentation,
  parseRuntimeFilterBarPresentation,
} from './filter-bar/validate-runtime-filter-bar-presentation';
import {
  validateRuntimeInputPresentation,
  parseRuntimeInputPresentation,
} from './input/validate-runtime-input-presentation';
import {
  validateRuntimeLoadingStatePresentation,
  parseRuntimeLoadingStatePresentation,
} from './loading-state/validate-runtime-loading-state-presentation';
import {
  validateRuntimeMetricCardPresentation,
  parseRuntimeMetricCardPresentation,
} from './metric-card/validate-runtime-metric-card-presentation';
import {
  validateRuntimeRadioGroupPresentation,
  parseRuntimeRadioGroupPresentation,
} from './radio-group/validate-runtime-radio-group-presentation';
import {
  validateRuntimeSelectPresentation,
  parseRuntimeSelectPresentation,
} from './select/validate-runtime-select-presentation';
import {
  validateRuntimeTextareaPresentation,
  parseRuntimeTextareaPresentation,
} from './textarea/validate-runtime-textarea-presentation';
import {
  validateRuntimeTogglePresentation,
  parseRuntimeTogglePresentation,
} from './toggle/validate-runtime-toggle-presentation';

// ── ActivityFeed ──────────────────────────────────────────────────────────────

describe('validateRuntimeActivityFeedPresentation', () => {
  const valid = { items: [] };

  it('returns ok:true for valid input', () => {
    const result = validateRuntimeActivityFeedPresentation(valid);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.errors).toEqual([]);
  });

  it('returns ok:false for invalid input', () => {
    const result = validateRuntimeActivityFeedPresentation({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.length).toBeGreaterThan(0);
  });

  it('maps errors to STRUCTURAL_VALIDATION_ERROR code', () => {
    const result = validateRuntimeActivityFeedPresentation({});
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeActivityFeedPresentation succeeds for valid input', () => {
    expect(() => parseRuntimeActivityFeedPresentation(valid)).not.toThrow();
  });

  it('parseRuntimeActivityFeedPresentation throws for invalid input', () => {
    expect(() => parseRuntimeActivityFeedPresentation({})).toThrow();
  });
});

// ── BulkCommandBar ────────────────────────────────────────────────────────────

describe('validateRuntimeBulkCommandBarPresentation', () => {
  const valid = { selectedCount: 0, actions: [] };

  it('returns ok:true for valid input', () => {
    const result = validateRuntimeBulkCommandBarPresentation(valid);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for invalid input', () => {
    const result = validateRuntimeBulkCommandBarPresentation({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeBulkCommandBarPresentation succeeds for valid input', () => {
    expect(() => parseRuntimeBulkCommandBarPresentation(valid)).not.toThrow();
  });

  it('parseRuntimeBulkCommandBarPresentation throws for invalid input', () => {
    expect(() => parseRuntimeBulkCommandBarPresentation({})).toThrow();
  });
});

// ── Checkbox ──────────────────────────────────────────────────────────────────

describe('validateRuntimeCheckboxPresentation', () => {
  it('returns ok:true for valid input (all optional)', () => {
    const result = validateRuntimeCheckboxPresentation({});
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for non-object input', () => {
    const result = validateRuntimeCheckboxPresentation(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeCheckboxPresentation succeeds for valid input', () => {
    expect(() => parseRuntimeCheckboxPresentation({})).not.toThrow();
  });

  it('parseRuntimeCheckboxPresentation throws for invalid input', () => {
    expect(() => parseRuntimeCheckboxPresentation(null)).toThrow();
  });
});

// ── DashboardPage ─────────────────────────────────────────────────────────────

describe('validateRuntimeDashboardPagePresentation', () => {
  const valid = { title: 'Dashboard' };

  it('returns ok:true for valid input', () => {
    const result = validateRuntimeDashboardPagePresentation(valid);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false when title is missing', () => {
    const result = validateRuntimeDashboardPagePresentation({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeDashboardPagePresentation succeeds for valid input', () => {
    expect(() => parseRuntimeDashboardPagePresentation(valid)).not.toThrow();
  });

  it('parseRuntimeDashboardPagePresentation throws for invalid input', () => {
    expect(() => parseRuntimeDashboardPagePresentation({})).toThrow();
  });
});

// ── DateInput ─────────────────────────────────────────────────────────────────

describe('validateRuntimeDateInputPresentation', () => {
  it('returns ok:true for valid input (all optional)', () => {
    const result = validateRuntimeDateInputPresentation({});
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for non-object input', () => {
    const result = validateRuntimeDateInputPresentation(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeDateInputPresentation succeeds for valid input', () => {
    expect(() => parseRuntimeDateInputPresentation({})).not.toThrow();
  });

  it('parseRuntimeDateInputPresentation throws for invalid input', () => {
    expect(() => parseRuntimeDateInputPresentation(null)).toThrow();
  });
});

// ── DetailItem ────────────────────────────────────────────────────────────────

describe('validateRuntimeDetailItem', () => {
  const valid = { type: 'detail-item', key: 'name', label: 'Name', field: 'name', kind: 'text' };

  it('returns ok:true for valid input', () => {
    const result = validateRuntimeDetailItem(valid);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for invalid input', () => {
    const result = validateRuntimeDetailItem({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeDetailItem succeeds for valid input', () => {
    expect(() => parseRuntimeDetailItem(valid)).not.toThrow();
  });

  it('parseRuntimeDetailItem throws for invalid input', () => {
    expect(() => parseRuntimeDetailItem({})).toThrow();
  });
});

// ── DetailPage ────────────────────────────────────────────────────────────────

describe('validateRuntimeDetailPagePresentation', () => {
  const valid = {
    title: 'Customer Detail',
    content: { key: 'overview' },
    metadata: [
      { key: 'createdAt', label: 'Created At', value: '2024-01-01' },
      { key: 'createdBy', label: 'Created By', value: 'admin' },
      { key: 'updatedAt', label: 'Updated At', value: '2024-01-01' },
      { key: 'updatedBy', label: 'Updated By', value: 'admin' },
      { key: 'version', label: 'Version', value: '1' },
    ],
    tabs: [
      { key: 'overview', label: 'Overview', href: '/overview' },
      { key: 'history', label: 'History', href: '/history' },
      { key: 'audit', label: 'Audit', href: '/audit' },
    ],
    activeTabKey: 'overview',
  };

  it('returns ok:true for valid input', () => {
    const result = validateRuntimeDetailPagePresentation(valid);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false when title is missing', () => {
    const result = validateRuntimeDetailPagePresentation({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeDetailPagePresentation succeeds for valid input', () => {
    expect(() => parseRuntimeDetailPagePresentation(valid)).not.toThrow();
  });

  it('parseRuntimeDetailPagePresentation throws for invalid input', () => {
    expect(() => parseRuntimeDetailPagePresentation({})).toThrow();
  });
});

// ── EmptyState ────────────────────────────────────────────────────────────────

describe('validateRuntimeEmptyStatePresentation', () => {
  const valid = { title: 'No items found' };

  it('returns ok:true for valid input', () => {
    const result = validateRuntimeEmptyStatePresentation(valid);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false when title is missing', () => {
    const result = validateRuntimeEmptyStatePresentation({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeEmptyStatePresentation succeeds for valid input', () => {
    expect(() => parseRuntimeEmptyStatePresentation(valid)).not.toThrow();
  });

  it('parseRuntimeEmptyStatePresentation throws for invalid input', () => {
    expect(() => parseRuntimeEmptyStatePresentation({})).toThrow();
  });
});

// ── ErrorState ────────────────────────────────────────────────────────────────

describe('validateRuntimeErrorStatePresentation', () => {
  const valid = { title: 'Something went wrong' };

  it('returns ok:true for valid input', () => {
    const result = validateRuntimeErrorStatePresentation(valid);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false when title is missing', () => {
    const result = validateRuntimeErrorStatePresentation({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeErrorStatePresentation succeeds for valid input', () => {
    expect(() => parseRuntimeErrorStatePresentation(valid)).not.toThrow();
  });

  it('parseRuntimeErrorStatePresentation throws for invalid input', () => {
    expect(() => parseRuntimeErrorStatePresentation({})).toThrow();
  });
});

// ── FilterBar ─────────────────────────────────────────────────────────────────

describe('validateRuntimeFilterBarPresentation', () => {
  it('returns ok:true for valid input (all optional)', () => {
    const result = validateRuntimeFilterBarPresentation({});
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for non-object input', () => {
    const result = validateRuntimeFilterBarPresentation(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeFilterBarPresentation succeeds for valid input', () => {
    expect(() => parseRuntimeFilterBarPresentation({})).not.toThrow();
  });

  it('parseRuntimeFilterBarPresentation throws for invalid input', () => {
    expect(() => parseRuntimeFilterBarPresentation(null)).toThrow();
  });
});

// ── Input ─────────────────────────────────────────────────────────────────────

describe('validateRuntimeInputPresentation', () => {
  it('returns ok:true for valid input (all optional)', () => {
    const result = validateRuntimeInputPresentation({});
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for non-object input', () => {
    const result = validateRuntimeInputPresentation(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeInputPresentation succeeds for valid input', () => {
    expect(() => parseRuntimeInputPresentation({})).not.toThrow();
  });

  it('parseRuntimeInputPresentation throws for invalid input', () => {
    expect(() => parseRuntimeInputPresentation(null)).toThrow();
  });
});

// ── LoadingState ──────────────────────────────────────────────────────────────

describe('validateRuntimeLoadingStatePresentation', () => {
  it('returns ok:true for valid input (all optional)', () => {
    const result = validateRuntimeLoadingStatePresentation({});
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for non-object input', () => {
    const result = validateRuntimeLoadingStatePresentation(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeLoadingStatePresentation succeeds for valid input', () => {
    expect(() => parseRuntimeLoadingStatePresentation({})).not.toThrow();
  });

  it('parseRuntimeLoadingStatePresentation throws for invalid input', () => {
    expect(() => parseRuntimeLoadingStatePresentation(null)).toThrow();
  });
});

// ── MetricCard ────────────────────────────────────────────────────────────────

describe('validateRuntimeMetricCardPresentation', () => {
  const valid = { label: 'Total Tickets', value: '42' };

  it('returns ok:true for valid input', () => {
    const result = validateRuntimeMetricCardPresentation(valid);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false when label is missing', () => {
    const result = validateRuntimeMetricCardPresentation({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeMetricCardPresentation succeeds for valid input', () => {
    expect(() => parseRuntimeMetricCardPresentation(valid)).not.toThrow();
  });

  it('parseRuntimeMetricCardPresentation throws for invalid input', () => {
    expect(() => parseRuntimeMetricCardPresentation({})).toThrow();
  });
});

// ── RadioGroup ────────────────────────────────────────────────────────────────

describe('validateRuntimeRadioGroupPresentation', () => {
  const valid = { options: [{ value: 'a', label: 'Option A' }] };

  it('returns ok:true for valid input', () => {
    const result = validateRuntimeRadioGroupPresentation(valid);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false when options is missing', () => {
    const result = validateRuntimeRadioGroupPresentation({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeRadioGroupPresentation succeeds for valid input', () => {
    expect(() => parseRuntimeRadioGroupPresentation(valid)).not.toThrow();
  });

  it('parseRuntimeRadioGroupPresentation throws for invalid input', () => {
    expect(() => parseRuntimeRadioGroupPresentation({})).toThrow();
  });
});

// ── Select ────────────────────────────────────────────────────────────────────

describe('validateRuntimeSelectPresentation', () => {
  const valid = { options: [] };

  it('returns ok:true for valid input', () => {
    const result = validateRuntimeSelectPresentation(valid);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false when options is missing', () => {
    const result = validateRuntimeSelectPresentation({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeSelectPresentation succeeds for valid input', () => {
    expect(() => parseRuntimeSelectPresentation(valid)).not.toThrow();
  });

  it('parseRuntimeSelectPresentation throws for invalid input', () => {
    expect(() => parseRuntimeSelectPresentation({})).toThrow();
  });
});

// ── Textarea ──────────────────────────────────────────────────────────────────

describe('validateRuntimeTextareaPresentation', () => {
  it('returns ok:true for valid input (all optional)', () => {
    const result = validateRuntimeTextareaPresentation({});
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for non-object input', () => {
    const result = validateRuntimeTextareaPresentation(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeTextareaPresentation succeeds for valid input', () => {
    expect(() => parseRuntimeTextareaPresentation({})).not.toThrow();
  });

  it('parseRuntimeTextareaPresentation throws for invalid input', () => {
    expect(() => parseRuntimeTextareaPresentation(null)).toThrow();
  });
});

// ── Toggle ────────────────────────────────────────────────────────────────────

describe('validateRuntimeTogglePresentation', () => {
  it('returns ok:true for valid input (all optional)', () => {
    const result = validateRuntimeTogglePresentation({});
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for non-object input', () => {
    const result = validateRuntimeTogglePresentation(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('STRUCTURAL_VALIDATION_ERROR');
  });

  it('parseRuntimeTogglePresentation succeeds for valid input', () => {
    expect(() => parseRuntimeTogglePresentation({})).not.toThrow();
  });

  it('parseRuntimeTogglePresentation throws for invalid input', () => {
    expect(() => parseRuntimeTogglePresentation(null)).toThrow();
  });
});

// ── Schema superRefine error branches ─────────────────────────────────────────

describe('ActivityFeed schema superRefine branches', () => {
  it('fails when action has no href or actionKey', () => {
    const result = validateRuntimeActivityFeedPresentation({ items: [], action: { label: 'View all' } });
    expect(result.ok).toBe(false);
  });

  it('fails when items have duplicate keys', () => {
    const result = validateRuntimeActivityFeedPresentation({
      items: [{ key: 'a', summary: 'First' }, { key: 'a', summary: 'Second' }],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when action.label is blank', () => {
    const result = validateRuntimeActivityFeedPresentation({ items: [], action: { label: '  ', href: '/all' } });
    expect(result.ok).toBe(false);
  });
});

describe('BulkCommandBar schema superRefine branches', () => {
  it('fails when overflow action key conflicts with action key', () => {
    const result = validateRuntimeBulkCommandBarPresentation({
      selectedCount: 0,
      actions: [{ key: 'dup', label: 'Edit', actionKey: 'edit' }],
      overflowActions: [{ key: 'dup', label: 'Export', actionKey: 'export' }],
    });
    expect(result.ok).toBe(false);
  });
});

describe('Checkbox schema superRefine branches', () => {
  it('fails when both checked and defaultChecked are set', () => {
    const result = validateRuntimeCheckboxPresentation({ checked: true, defaultChecked: true });
    expect(result.ok).toBe(false);
  });
});

describe('DashboardPage schema superRefine branches', () => {
  it('fails when title is blank', () => {
    const result = validateRuntimeDashboardPagePresentation({ title: '  ' });
    expect(result.ok).toBe(false);
  });

  it('fails when action keys are duplicate', () => {
    const result = validateRuntimeDashboardPagePresentation({
      title: 'Dashboard',
      actions: [
        { key: 'dup', label: 'A', actionKey: 'act1' },
        { key: 'dup', label: 'B', actionKey: 'act2' },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when widget keys are duplicate within same zone', () => {
    const result = validateRuntimeDashboardPagePresentation({
      title: 'Dashboard',
      kpis: [{ key: 'dup', title: 'A', size: 'small' }, { key: 'dup', title: 'B', size: 'small' }],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when widget key appears in multiple zones', () => {
    const result = validateRuntimeDashboardPagePresentation({
      title: 'Dashboard',
      kpis: [{ key: 'shared', title: 'A', size: 'small' }],
      primaryWidgets: [{ key: 'shared', title: 'B', size: 'medium' }],
    });
    expect(result.ok).toBe(false);
  });
});

describe('DateInput schema superRefine branches', () => {
  it('fails when both value and defaultValue are set', () => {
    const result = validateRuntimeDateInputPresentation({ value: '2024-01-01', defaultValue: '2024-01-01' });
    expect(result.ok).toBe(false);
  });
});

describe('DetailItem schema superRefine branches', () => {
  const base = { type: 'detail-item', key: 'x', label: 'X', field: 'x' };

  it('fails when truncate=true on long-text', () => {
    const result = validateRuntimeDetailItem({ ...base, kind: 'long-text', truncate: true });
    expect(result.ok).toBe(false);
  });

  it('fails when truncate=true on badge-list', () => {
    const result = validateRuntimeDetailItem({ ...base, kind: 'badge-list', truncate: true });
    expect(result.ok).toBe(false);
  });
});

describe('EmptyState schema superRefine branches', () => {
  it('fails when primaryAction has no actionKey or href', () => {
    const result = validateRuntimeEmptyStatePresentation({ title: 'Empty', primaryAction: { label: 'Go' } });
    expect(result.ok).toBe(false);
  });

  it('fails when title is blank', () => {
    const result = validateRuntimeEmptyStatePresentation({ title: '  ' });
    expect(result.ok).toBe(false);
  });

  it('fails when primaryAction.label is blank', () => {
    const result = validateRuntimeEmptyStatePresentation({ title: 'Empty', primaryAction: { label: '  ', href: '/x' } });
    expect(result.ok).toBe(false);
  });

  it('fails when secondaryAction.label is blank', () => {
    const result = validateRuntimeEmptyStatePresentation({
      title: 'Empty',
      secondaryAction: { label: '  ', href: '/x' },
    });
    expect(result.ok).toBe(false);
  });
});

describe('ErrorState schema superRefine branches', () => {
  it('fails when secondaryAction has no actionKey or href', () => {
    const result = validateRuntimeErrorStatePresentation({ title: 'Error', secondaryAction: { label: 'Help' } });
    expect(result.ok).toBe(false);
  });

  it('fails when title is blank', () => {
    const result = validateRuntimeErrorStatePresentation({ title: '  ' });
    expect(result.ok).toBe(false);
  });

  it('fails when retryAction.label is blank', () => {
    const result = validateRuntimeErrorStatePresentation({ title: 'Error', retryAction: { label: '  ' } });
    expect(result.ok).toBe(false);
  });

  it('fails when secondaryAction.label is blank', () => {
    const result = validateRuntimeErrorStatePresentation({
      title: 'Error',
      secondaryAction: { label: '  ', href: '/help' },
    });
    expect(result.ok).toBe(false);
  });

  it('fails when description is blank', () => {
    const result = validateRuntimeErrorStatePresentation({ title: 'Error', description: '  ' });
    expect(result.ok).toBe(false);
  });

  it('fails when icon is blank', () => {
    const result = validateRuntimeErrorStatePresentation({ title: 'Error', icon: '  ' });
    expect(result.ok).toBe(false);
  });
});

describe('FilterBar schema superRefine branches', () => {
  it('fails when duplicate filter keys', () => {
    const result = validateRuntimeFilterBarPresentation({
      filters: [
        { key: 'dup', label: 'A', type: 'text' },
        { key: 'dup', label: 'B', type: 'text' },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when select filter has no options (undefined)', () => {
    const result = validateRuntimeFilterBarPresentation({
      filters: [{ key: 'status', label: 'Status', type: 'select' }],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when select filter has empty options array', () => {
    const result = validateRuntimeFilterBarPresentation({
      filters: [{ key: 'status', label: 'Status', type: 'select', options: [] }],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when text filter has options', () => {
    const result = validateRuntimeFilterBarPresentation({
      filters: [{ key: 'name', label: 'Name', type: 'text', options: [{ label: 'A', value: 'a' }] }],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when sort options have duplicate values', () => {
    const result = validateRuntimeFilterBarPresentation({
      sort: {
        options: [
          { label: 'A', value: 'dup' },
          { label: 'B', value: 'dup' },
        ],
      },
    });
    expect(result.ok).toBe(false);
  });
});

describe('Input schema superRefine branches', () => {
  it('fails when both value and defaultValue are set', () => {
    const result = validateRuntimeInputPresentation({ value: 'x', defaultValue: 'y' });
    expect(result.ok).toBe(false);
  });
});

describe('LoadingState schema superRefine branches', () => {
  it('fails when label is blank', () => {
    const result = validateRuntimeLoadingStatePresentation({ label: '  ' });
    expect(result.ok).toBe(false);
  });

  it('fails when description is blank', () => {
    const result = validateRuntimeLoadingStatePresentation({ description: '  ' });
    expect(result.ok).toBe(false);
  });
});

describe('MetricCard schema superRefine branches', () => {
  it('fails when label is blank', () => {
    const result = validateRuntimeMetricCardPresentation({ label: '  ', value: '42' });
    expect(result.ok).toBe(false);
  });

  it('fails when value is blank', () => {
    const result = validateRuntimeMetricCardPresentation({ label: 'Total', value: '  ' });
    expect(result.ok).toBe(false);
  });

  it('fails when MetricCardAction has no href or actionKey', () => {
    const result = validateRuntimeMetricCardPresentation({ label: 'Total', value: '42', action: { label: 'View' } });
    expect(result.ok).toBe(false);
  });

  it('fails when action.label is blank', () => {
    const result = validateRuntimeMetricCardPresentation({
      label: 'Total',
      value: '42',
      action: { label: '  ', href: '/x' },
    });
    expect(result.ok).toBe(false);
  });
});

describe('RadioGroup schema superRefine branches', () => {
  it('fails when both value and defaultValue are set', () => {
    const result = validateRuntimeRadioGroupPresentation({
      options: [{ value: 'a', label: 'A' }],
      value: 'a',
      defaultValue: 'a',
    });
    expect(result.ok).toBe(false);
  });

  it('fails when options have duplicate values', () => {
    const result = validateRuntimeRadioGroupPresentation({
      options: [{ value: 'dup', label: 'A' }, { value: 'dup', label: 'B' }],
    });
    expect(result.ok).toBe(false);
  });
});

describe('Select schema superRefine branches', () => {
  it('fails when both value and defaultValue are set', () => {
    const result = validateRuntimeSelectPresentation({
      options: [],
      value: 'a',
      defaultValue: 'b',
    });
    expect(result.ok).toBe(false);
  });

  it('fails when options have duplicate values', () => {
    const result = validateRuntimeSelectPresentation({
      options: [{ value: 'dup', label: 'A' }, { value: 'dup', label: 'B' }],
    });
    expect(result.ok).toBe(false);
  });
});

describe('Textarea schema superRefine branches', () => {
  it('fails when both value and defaultValue are set', () => {
    const result = validateRuntimeTextareaPresentation({ value: 'x', defaultValue: 'y' });
    expect(result.ok).toBe(false);
  });
});

describe('Toggle schema superRefine branches', () => {
  it('fails when both checked and defaultChecked are set', () => {
    const result = validateRuntimeTogglePresentation({ checked: true, defaultChecked: true });
    expect(result.ok).toBe(false);
  });
});

describe('DetailPage schema superRefine branches', () => {
  const validBase = {
    title: 'Record',
    content: { key: 'overview' },
    metadata: [
      { key: 'createdAt', label: 'Created At', value: '2024-01-01' },
      { key: 'createdBy', label: 'Created By', value: 'admin' },
      { key: 'updatedAt', label: 'Updated At', value: '2024-01-01' },
      { key: 'updatedBy', label: 'Updated By', value: 'admin' },
      { key: 'version', label: 'Version', value: '1' },
    ],
    tabs: [
      { key: 'overview', label: 'Overview', href: '/overview' },
      { key: 'history', label: 'History', href: '/history' },
      { key: 'audit', label: 'Audit', href: '/audit' },
    ],
    activeTabKey: 'overview',
  };

  it('fails when title is blank', () => {
    const result = validateRuntimeDetailPagePresentation({ ...validBase, title: '  ' });
    expect(result.ok).toBe(false);
  });

  it('fails when metadata has duplicate keys', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      metadata: [
        ...validBase.metadata,
        { key: 'createdAt', label: 'Created Again', value: '2024-01-02' },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when required metadata key is missing', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      metadata: [{ key: 'createdAt', label: 'Created At', value: '2024-01-01' }],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when tabs have duplicate keys', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      tabs: [
        { key: 'overview', label: 'Overview', href: '/overview' },
        { key: 'overview', label: 'Overview 2', href: '/overview2' },
        { key: 'history', label: 'History', href: '/history' },
        { key: 'audit', label: 'Audit', href: '/audit' },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when activeTabKey does not match any tab', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      activeTabKey: 'nonexistent',
    });
    expect(result.ok).toBe(false);
  });

  it('fails when overview tab is missing', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      tabs: [
        { key: 'domain', label: 'Domain', href: '/domain' },
        { key: 'history', label: 'History', href: '/history' },
        { key: 'audit', label: 'Audit', href: '/audit' },
      ],
      activeTabKey: 'domain',
    });
    expect(result.ok).toBe(false);
  });

  it('fails when overview tab is not first', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      tabs: [
        { key: 'domain', label: 'Domain', href: '/domain' },
        { key: 'overview', label: 'Overview', href: '/overview' },
        { key: 'history', label: 'History', href: '/history' },
        { key: 'audit', label: 'Audit', href: '/audit' },
      ],
      activeTabKey: 'overview',
    });
    expect(result.ok).toBe(false);
  });

  it('fails when history tab is missing', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      tabs: [
        { key: 'overview', label: 'Overview', href: '/overview' },
        { key: 'audit', label: 'Audit', href: '/audit' },
      ],
      activeTabKey: 'overview',
    });
    expect(result.ok).toBe(false);
  });

  it('fails when audit tab is missing', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      tabs: [
        { key: 'overview', label: 'Overview', href: '/overview' },
        { key: 'history', label: 'History', href: '/history' },
      ],
      activeTabKey: 'overview',
    });
    expect(result.ok).toBe(false);
  });

  it('fails when history appears after audit', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      tabs: [
        { key: 'overview', label: 'Overview', href: '/overview' },
        { key: 'audit', label: 'Audit', href: '/audit' },
        { key: 'history', label: 'History', href: '/history' },
      ],
      activeTabKey: 'overview',
    });
    expect(result.ok).toBe(false);
  });

  it('fails when history tab is not in governance region', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      tabs: [
        { key: 'overview', label: 'Overview', href: '/overview' },
        { key: 'history', label: 'History', href: '/history' },
        { key: 'domain', label: 'Domain', href: '/domain' },
        { key: 'audit', label: 'Audit', href: '/audit' },
      ],
      activeTabKey: 'overview',
    });
    expect(result.ok).toBe(false);
  });

  it('fails when audit tab is not last', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      tabs: [
        { key: 'overview', label: 'Overview', href: '/overview' },
        { key: 'audit', label: 'Audit', href: '/audit' },
        { key: 'history', label: 'History', href: '/history' },
      ],
      activeTabKey: 'overview',
    });
    expect(result.ok).toBe(false);
  });

  it('fails when action keys are duplicate', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      actions: [
        { key: 'dup', label: 'A', actionKey: 'act1' },
        { key: 'dup', label: 'B', actionKey: 'act2' },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when isEditing=true without overviewEditable', () => {
    const result = validateRuntimeDetailPagePresentation({ ...validBase, isEditing: true });
    expect(result.ok).toBe(false);
  });

  it('fails when isEditing=true on non-overview active tab', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      tabs: [
        { key: 'overview', label: 'Overview', href: '/overview' },
        { key: 'domain', label: 'Domain', href: '/domain' },
        { key: 'history', label: 'History', href: '/history' },
        { key: 'audit', label: 'Audit', href: '/audit' },
      ],
      activeTabKey: 'domain',
      isEditing: true,
      overviewEditable: true,
    });
    expect(result.ok).toBe(false);
  });

  it('fails when action has neither href nor actionKey', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      actions: [{ key: 'a', label: 'Act' }],
    });
    expect(result.ok).toBe(false);
  });

  it('fails when action has both href and actionKey', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      actions: [{ key: 'a', label: 'Act', href: '/path', actionKey: 'act' }],
    });
    expect(result.ok).toBe(false);
  });

  it('parses successfully when tab has explicit kind set', () => {
    const result = validateRuntimeDetailPagePresentation({
      ...validBase,
      tabs: [
        { key: 'overview', label: 'Overview', href: '/overview' },
        { key: 'custom-domain', label: 'Domain', href: '/domain', kind: 'domain' },
        { key: 'history', label: 'History', href: '/history' },
        { key: 'audit', label: 'Audit', href: '/audit' },
      ],
    });
    expect(result.ok).toBe(true);
  });
});
