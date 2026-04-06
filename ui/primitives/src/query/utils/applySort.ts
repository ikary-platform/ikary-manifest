import type { SortRule } from '../shared/sort';

export function applySort(records: Record<string, unknown>[], sort?: SortRule[]): Record<string, unknown>[] {
  if (!sort || sort.length === 0) return records;
  return [...records].sort((a, b) => {
    for (const rule of sort) {
      const av = a[rule.field];
      const bv = b[rule.field];
      const cmp =
        typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
      if (cmp !== 0) return rule.direction === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
}
