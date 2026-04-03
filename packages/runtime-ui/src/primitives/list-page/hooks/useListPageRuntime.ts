import { useState, useMemo, useCallback } from 'react';
import type { ListPageResolverRuntime } from '../ListPage.resolver';

export interface UseListPageRuntimeOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export interface UseListPageRuntimeResult<T extends Record<string, unknown>> {
  /** Pass to useCellEntityList as the query argument */
  query: {
    page: number;
    pageSize: number;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;
  };
  /** Call with fetched data to produce the resolver runtime */
  buildRuntime: (rows: T[], total: number, isLoading: boolean) => ListPageResolverRuntime<T>;
}

export function useListPageRuntime<T extends Record<string, unknown> = Record<string, unknown>>(
  opts: UseListPageRuntimeOptions = {},
): UseListPageRuntimeResult<T> {
  const [page, setPage] = useState(opts.initialPage ?? 1);
  const [pageSize, setPageSize] = useState(opts.initialPageSize ?? 20);
  const [sort, setSort] = useState<{ field?: string; dir?: 'asc' | 'desc' }>({});
  const [search, setSearch] = useState('');

  const query = useMemo(
    () => ({
      page,
      pageSize,
      ...(sort.field ? { sortField: sort.field, sortDir: sort.dir ?? 'asc' } : {}),
      ...(search ? { search } : {}),
    }),
    [page, pageSize, sort, search],
  );

  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSort({ field, dir: direction });
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const buildRuntime = useCallback(
    (rows: T[], total: number, isLoading: boolean): ListPageResolverRuntime<T> => ({
      rendererRuntime: {
        rows,
        getRowId: (row: T, index: number) => String(row['id'] ?? index),
        loading: isLoading,
        ...(sort.field ? { sort: { field: sort.field, direction: sort.dir ?? 'asc' } } : {}),
        onSortChange: handleSortChange,
      },
      paginationRuntime: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        onPageChange: setPage,
        onPageSizeChange: (size: number) => {
          setPageSize(size);
          setPage(1);
        },
      },
      controlsRuntime: {
        searchValue: search,
        onSearchChange: handleSearchChange,
        sortingLabel: sort.field ? `Sorted by ${sort.field} (${sort.dir ?? 'asc'})` : undefined,
      },
      loading: isLoading,
    }),
    [page, pageSize, sort, search, handleSortChange, handleSearchChange],
  );

  return { query, buildRuntime };
}
