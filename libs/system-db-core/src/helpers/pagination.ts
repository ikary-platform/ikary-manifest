import type { SelectQueryBuilder } from 'kysely';

export interface PaginationQuery {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function applyPagination<DB, TB extends keyof DB, O>(
  query: SelectQueryBuilder<DB, TB, O>,
  pagination: PaginationQuery,
): SelectQueryBuilder<DB, TB, O> {
  const offset = (pagination.page - 1) * pagination.pageSize;
  return query.limit(pagination.pageSize).offset(offset);
}

export function buildPaginatedResponse<T>(input: {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}): PaginatedResult<T> {
  return {
    data: input.data,
    total: input.total,
    page: input.page,
    pageSize: input.pageSize,
    hasMore: input.page * input.pageSize < input.total,
  };
}
