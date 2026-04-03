import type { FilterGroup } from './filters';

export type AggregateMetric =
  | { op: 'count'; as: string }
  | { op: 'sum'; field: string; as: string }
  | { op: 'avg'; field: string; as: string }
  | { op: 'min'; field: string; as: string }
  | { op: 'max'; field: string; as: string };

export interface AggregateParams {
  entity: string;
  filter?: FilterGroup;
  metrics: AggregateMetric[];
}

export interface AggregateResult {
  values: Record<string, number | null>;
}
