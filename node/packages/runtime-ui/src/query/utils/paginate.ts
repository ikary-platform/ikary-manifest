import type { ListResult } from '../shared/list';

export function paginate<T>(items: T[], page: number, pageSize: number): ListResult<T> {
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  };
}
