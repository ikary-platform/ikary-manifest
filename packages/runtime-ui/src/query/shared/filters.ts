export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'isNull'
  | 'isNotNull';

export interface FilterRule {
  field: string;
  op: FilterOperator;
  value?: unknown;
}

export interface FilterGroup {
  logic: 'and' | 'or';
  filters: Array<FilterRule | FilterGroup>;
}

export function isFilterGroup(f: FilterRule | FilterGroup): f is FilterGroup {
  return 'logic' in f;
}
