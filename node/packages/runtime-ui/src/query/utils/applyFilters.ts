import type { FilterGroup, FilterRule } from '../shared/filters';
import { isFilterGroup } from '../shared/filters';

function matchRule(record: Record<string, unknown>, rule: FilterRule): boolean {
  const val = record[rule.field];
  switch (rule.op) {
    case 'eq':
      return val === rule.value;
    case 'ne':
      return val !== rule.value;
    case 'gt':
      return (val as number) > (rule.value as number);
    case 'gte':
      return (val as number) >= (rule.value as number);
    case 'lt':
      return (val as number) < (rule.value as number);
    case 'lte':
      return (val as number) <= (rule.value as number);
    case 'in':
      return Array.isArray(rule.value) && rule.value.includes(val);
    case 'contains':
      return typeof val === 'string' && val.includes(String(rule.value));
    case 'startsWith':
      return typeof val === 'string' && val.startsWith(String(rule.value));
    case 'endsWith':
      return typeof val === 'string' && val.endsWith(String(rule.value));
    case 'isNull':
      return val === null || val === undefined;
    case 'isNotNull':
      return val !== null && val !== undefined;
    default:
      return true;
  }
}

export function applyFilters(records: Record<string, unknown>[], group?: FilterGroup): Record<string, unknown>[] {
  if (!group || group.filters.length === 0) return records;
  return records.filter((record) => {
    const results = group.filters.map((f) =>
      isFilterGroup(f) ? applyFilters([record], f).length > 0 : matchRule(record, f),
    );
    return group.logic === 'and' ? results.every(Boolean) : results.some(Boolean);
  });
}
