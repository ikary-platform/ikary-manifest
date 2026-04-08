import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { applyFilters } from './applyFilters';
import { applySort } from './applySort';
import { delay } from './delay';
import { paginate } from './paginate';
import { projectFields } from './projectFields';
import type { FilterGroup } from '../shared/filters';
import type { SortRule } from '../shared/sort';

// ── applyFilters ──────────────────────────────────────────────────────────────

describe('applyFilters', () => {
  const records = [
    { name: 'Alice', age: 30, score: 95.5, active: true, email: 'alice@example.com', tag: null },
    { name: 'Bob', age: 25, score: 70.0, active: false, email: 'bob@test.org', tag: 'vip' },
    { name: 'Charlie', age: 35, score: 85.0, active: true, email: 'charlie@example.com', tag: 'vip' },
  ];

  it('returns all records when no group provided', () => {
    expect(applyFilters(records)).toHaveLength(3);
  });

  it('returns all records when group has empty filters', () => {
    expect(applyFilters(records, { logic: 'and', filters: [] })).toHaveLength(3);
  });

  it('filters with eq operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'name', op: 'eq', value: 'Alice' }] };
    expect(applyFilters(records, group)).toHaveLength(1);
    expect(applyFilters(records, group)[0].name).toBe('Alice');
  });

  it('filters with ne operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'name', op: 'ne', value: 'Alice' }] };
    expect(applyFilters(records, group)).toHaveLength(2);
  });

  it('filters with gt operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'age', op: 'gt', value: 30 }] };
    expect(applyFilters(records, group)).toHaveLength(1);
    expect(applyFilters(records, group)[0].name).toBe('Charlie');
  });

  it('filters with gte operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'age', op: 'gte', value: 30 }] };
    expect(applyFilters(records, group)).toHaveLength(2);
  });

  it('filters with lt operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'age', op: 'lt', value: 30 }] };
    expect(applyFilters(records, group)).toHaveLength(1);
    expect(applyFilters(records, group)[0].name).toBe('Bob');
  });

  it('filters with lte operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'age', op: 'lte', value: 30 }] };
    expect(applyFilters(records, group)).toHaveLength(2);
  });

  it('filters with in operator', () => {
    const group: FilterGroup = {
      logic: 'and',
      filters: [{ field: 'name', op: 'in', value: ['Alice', 'Bob'] }],
    };
    expect(applyFilters(records, group)).toHaveLength(2);
  });

  it('in operator returns false for non-array value', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'name', op: 'in', value: 'Alice' }] };
    expect(applyFilters(records, group)).toHaveLength(0);
  });

  it('filters with contains operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'email', op: 'contains', value: 'example' }] };
    expect(applyFilters(records, group)).toHaveLength(2);
  });

  it('contains returns false for non-string field', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'age', op: 'contains', value: '3' }] };
    expect(applyFilters(records, group)).toHaveLength(0);
  });

  it('filters with startsWith operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'name', op: 'startsWith', value: 'A' }] };
    expect(applyFilters(records, group)).toHaveLength(1);
  });

  it('startsWith returns false for non-string field', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'age', op: 'startsWith', value: '3' }] };
    expect(applyFilters(records, group)).toHaveLength(0);
  });

  it('filters with endsWith operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'email', op: 'endsWith', value: '.org' }] };
    expect(applyFilters(records, group)).toHaveLength(1);
  });

  it('endsWith returns false for non-string field', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'age', op: 'endsWith', value: '5' }] };
    expect(applyFilters(records, group)).toHaveLength(0);
  });

  it('filters with isNull operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'tag', op: 'isNull' }] };
    expect(applyFilters(records, group)).toHaveLength(1);
    expect(applyFilters(records, group)[0].name).toBe('Alice');
  });

  it('filters with isNotNull operator', () => {
    const group: FilterGroup = { logic: 'and', filters: [{ field: 'tag', op: 'isNotNull' }] };
    expect(applyFilters(records, group)).toHaveLength(2);
  });

  it('handles unknown operator by returning true (pass-through)', () => {
    const group: FilterGroup = {
      logic: 'and',
      filters: [{ field: 'name', op: 'unknown' as never, value: 'anything' }],
    };
    expect(applyFilters(records, group)).toHaveLength(3);
  });

  it('supports OR logic', () => {
    const group: FilterGroup = {
      logic: 'or',
      filters: [
        { field: 'name', op: 'eq', value: 'Alice' },
        { field: 'name', op: 'eq', value: 'Bob' },
      ],
    };
    expect(applyFilters(records, group)).toHaveLength(2);
  });

  it('supports nested filter groups', () => {
    const innerGroup: FilterGroup = {
      logic: 'and',
      filters: [{ field: 'active', op: 'eq', value: true }],
    };
    const outerGroup: FilterGroup = {
      logic: 'and',
      filters: [innerGroup, { field: 'age', op: 'gte', value: 35 }],
    };
    expect(applyFilters(records, outerGroup)).toHaveLength(1);
    expect(applyFilters(records, outerGroup)[0].name).toBe('Charlie');
  });
});

// ── applySort ─────────────────────────────────────────────────────────────────

describe('applySort', () => {
  const records = [
    { name: 'Charlie', age: 35 },
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ];

  it('returns records unchanged when no sort provided', () => {
    expect(applySort(records)).toEqual(records);
  });

  it('returns records unchanged when sort is empty', () => {
    expect(applySort(records, [])).toEqual(records);
  });

  it('sorts strings ascending', () => {
    const rules: SortRule[] = [{ field: 'name', direction: 'asc' }];
    const sorted = applySort(records, rules);
    expect(sorted.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('sorts strings descending', () => {
    const rules: SortRule[] = [{ field: 'name', direction: 'desc' }];
    const sorted = applySort(records, rules);
    expect(sorted.map((r) => r.name)).toEqual(['Charlie', 'Bob', 'Alice']);
  });

  it('sorts numbers ascending', () => {
    const rules: SortRule[] = [{ field: 'age', direction: 'asc' }];
    const sorted = applySort(records, rules);
    expect(sorted.map((r) => r.age)).toEqual([25, 30, 35]);
  });

  it('sorts numbers descending', () => {
    const rules: SortRule[] = [{ field: 'age', direction: 'desc' }];
    const sorted = applySort(records, rules);
    expect(sorted.map((r) => r.age)).toEqual([35, 30, 25]);
  });

  it('does not mutate the original array', () => {
    const original = [...records];
    applySort(records, [{ field: 'name', direction: 'asc' }]);
    expect(records).toEqual(original);
  });

  it('uses secondary sort rule when primary values are equal', () => {
    const tieRecords = [
      { name: 'Alice', age: 30 },
      { name: 'Alice', age: 25 },
    ];
    const rules: SortRule[] = [
      { field: 'name', direction: 'asc' },
      { field: 'age', direction: 'asc' },
    ];
    const sorted = applySort(tieRecords, rules);
    expect(sorted[0].age).toBe(25);
  });

  it('returns 0 when all sort rules are equal (stable)', () => {
    const tieRecords = [
      { name: 'Alice', age: 30 },
      { name: 'Alice', age: 30 },
    ];
    const rules: SortRule[] = [{ field: 'name', direction: 'asc' }];
    const sorted = applySort(tieRecords, rules);
    expect(sorted).toHaveLength(2);
  });

  it('treats undefined field values as empty string when sorting', () => {
    const sparse = [{ name: 'Bob' }, { name: undefined }, { name: 'Alice' }];
    const rules: SortRule[] = [{ field: 'name', direction: 'asc' }];
    const sorted = applySort(sparse as Record<string, unknown>[], rules);
    expect(sorted[0].name).toBeUndefined();
  });
});

// ── delay ─────────────────────────────────────────────────────────────────────

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a promise that resolves after a timeout', async () => {
    const promise = delay(100);
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
  });

  it('uses default duration when ms is not provided', async () => {
    const promise = delay();
    vi.advanceTimersByTime(200); // > max default of 80+120=200
    await expect(promise).resolves.toBeUndefined();
  });
});

// ── paginate ──────────────────────────────────────────────────────────────────

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('returns first page of items', () => {
    const result = paginate(items, 1, 3);
    expect(result.items).toEqual([1, 2, 3]);
    expect(result.total).toBe(10);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(3);
  });

  it('returns second page of items', () => {
    const result = paginate(items, 2, 3);
    expect(result.items).toEqual([4, 5, 6]);
  });

  it('returns partial last page', () => {
    const result = paginate(items, 4, 3);
    expect(result.items).toEqual([10]);
  });

  it('returns empty items for page beyond total', () => {
    const result = paginate(items, 5, 3);
    expect(result.items).toEqual([]);
  });
});

// ── projectFields ─────────────────────────────────────────────────────────────

describe('projectFields', () => {
  const record = { name: 'Alice', age: 30, email: 'alice@example.com' };

  it('returns full record when fields is undefined', () => {
    expect(projectFields(record)).toBe(record);
  });

  it('returns full record when fields is empty', () => {
    expect(projectFields(record, [])).toBe(record);
  });

  it('returns only specified fields', () => {
    const result = projectFields(record, ['name', 'age']);
    expect(result).toEqual({ name: 'Alice', age: 30 });
    expect(result).not.toHaveProperty('email');
  });
});
