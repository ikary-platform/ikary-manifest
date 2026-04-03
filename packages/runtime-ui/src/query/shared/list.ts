import type { FilterGroup } from './filters';
import type { SortRule } from './sort';

export interface ListParams {
  entity: string;
  filter?: FilterGroup;
  sort?: SortRule[];
  page?: number;
  pageSize?: number;
  fields?: string[];
}

export interface ListResult<T = Record<string, unknown>> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
