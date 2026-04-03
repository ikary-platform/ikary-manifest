import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildEntityDetailPath } from '@ikary-manifest/engine';
import type { DataGridColumn } from '@ikary-manifest/presentation';
import { EntityCreateSheet } from '../sheets/EntityCreateSheet';
import { CellDataGrid } from '../components/cell-data-grid';
import { useCellManifest, useCellRuntime } from '../context/cell-runtime-context';
import type { CellPageRendererProps } from '../registry/cell-component-registry';
import type { FieldDefinition } from '@ikary-manifest/contract';
import { resolveManifestEntity } from '../manifest/selectors';
import { useUIComponents } from '../UIComponentsProvider';

type Row = Record<string, unknown>;

// ---- derive helpers --------------------------------------------------------

function deriveDataGridColumns(listFields: FieldDefinition[]): DataGridColumn[] {
  return listFields.map((field, index) => {
    const isFirst = index === 0;
    const type: DataGridColumn['type'] = isFirst
      ? 'link'
      : field.type === 'enum'
        ? 'enum'
        : field.type === 'boolean'
          ? 'boolean'
          : field.type === 'datetime'
            ? 'datetime'
            : field.type === 'date'
              ? 'date'
              : field.type === 'number'
                ? 'number'
                : 'text';

    return {
      key: field.key,
      label: field.name,
      field: field.key,
      type,
      sortable: field.list?.sortable,
      sortField: field.key,
      ...(isFirst ? { linkTarget: { type: 'detail-page' as const } } : {}),
      ...(field.type === 'number' ? { align: 'end' as const } : {}),
    };
  });
}

function parseSortParam(s: string): { field: string; direction: 'asc' | 'desc' } | null {
  if (!s) return null;
  const i = s.lastIndexOf('_');
  if (i <= 0) return null;
  const dir = s.slice(i + 1);
  if (dir !== 'asc' && dir !== 'desc') return null;
  return { field: s.slice(0, i), direction: dir };
}

function deriveFilterableFields(listFields: FieldDefinition[]): FieldDefinition[] {
  return listFields.filter((f) => {
    if (f.type === 'object') return false;
    if (f.list?.filterable === false) return false;
    if (f.list?.filterable === true) return true;
    // auto-derive: enum and boolean fields that are list-visible
    if (f.list?.visible === false) return false;
    return f.type === 'enum' || f.type === 'boolean';
  });
}

function deriveSearchableFields(listFields: FieldDefinition[]): FieldDefinition[] {
  return listFields.filter((f) => {
    if (f.type === 'object') return false;
    if (f.list?.searchable === false) return false;
    if (f.list?.searchable === true) return true;
    // auto-derive: string and enum fields that are list-visible
    if (f.list?.visible === false) return false;
    return f.type === 'string' || f.type === 'enum';
  });
}

// ---- component -------------------------------------------------------------

function ListLoadingSkeleton() {
  return (
    <div className="space-y-2 p-6">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="h-10 w-full rounded bg-muted animate-pulse" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 w-full rounded bg-muted/60 animate-pulse" />
      ))}
    </div>
  );
}

export function EntityListPage({ page, entity }: CellPageRendererProps) {
  const { dataStore, dataMode } = useCellRuntime();
  const manifest = useCellManifest();
  const { ListPageLayout, SearchInput, PaginationControls } = useUIComponents();
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);

  // URL state
  const searchParam = searchParams.get('search') ?? '';
  const sortParam = searchParams.get('sort') ?? '';
  const pageParam = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const pageSizeParam = Number(searchParams.get('pageSize') ?? '20');

  // Filter params: filter_{key}
  const activeFilters = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter_')) {
        result[key.slice(7)] = value;
      }
    });
    return result;
  }, [searchParams]);

  // Local search input state (debounced to URL)
  const [searchInput, setSearchInput] = useState(searchParam);

  // Sync searchInput if URL changes externally
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Debounce: push searchInput to URL after 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (searchInput) {
            next.set('search', searchInput);
          } else {
            next.delete('search');
          }
          next.set('page', '1');
          return next;
        },
        { replace: true },
      );
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, setSearchParams]);

  const allRows: Row[] = useMemo(() => (entity ? (dataStore.getRows(entity.key) as Row[]) : []), [dataStore, entity]);
  const resolvedEntity = useMemo(
    () => (entity ? resolveManifestEntity(manifest, entity.key) : undefined),
    [entity, manifest],
  );
  const listFields = useMemo(() => resolvedEntity?.listFields ?? [], [resolvedEntity]);
  const filterableFields = useMemo(() => deriveFilterableFields(listFields), [listFields]);
  const searchableFields = useMemo(() => deriveSearchableFields(listFields), [listFields]);

  // ---- data pipeline ----

  // 1. Search
  const afterSearch = useMemo(() => {
    if (!searchParam) return allRows;
    const lower = searchParam.toLowerCase();
    return allRows.filter((row) =>
      searchableFields.some((f) => {
        const val = row[f.key];
        return val != null && String(val).toLowerCase().includes(lower);
      }),
    );
  }, [allRows, searchParam, searchableFields]);

  // 2. Filters
  const afterFilters = useMemo(() => {
    const entries = Object.entries(activeFilters);
    if (entries.length === 0) return afterSearch;
    return afterSearch.filter((row) => entries.every(([key, val]) => String(row[key] ?? '') === val));
  }, [afterSearch, activeFilters]);

  // 3. Sort
  const afterSort = useMemo(() => {
    const parsed = parseSortParam(sortParam);
    if (!parsed) return afterFilters;
    return [...afterFilters].sort((a, b) => {
      const av = String(a[parsed.field] ?? '');
      const bv = String(b[parsed.field] ?? '');
      const cmp = av.localeCompare(bv);
      return parsed.direction === 'desc' ? -cmp : cmp;
    });
  }, [afterFilters, sortParam]);

  // 4. Paginate
  const effectivePageSize = pageSizeParam || 20;
  const paginatedRows = useMemo(() => {
    const start = (pageParam - 1) * effectivePageSize;
    return afterSort.slice(start, start + effectivePageSize);
  }, [afterSort, pageParam, effectivePageSize]);

  // ---- columns ----
  const gridColumns = useMemo(() => deriveDataGridColumns(listFields), [listFields]);

  const getDetailHref = useCallback(
    (row: Row): string | null => (entity ? buildEntityDetailPath(manifest, entity.key, String(row['id'] ?? '')) : null),
    [entity, manifest],
  );

  // Show loading skeleton while the API query is still in flight
  const isLiveLoading = dataMode === 'live' && entity != null && dataStore.isListLoading(entity.key);

  if (!entity || !resolvedEntity) {
    return <div className="p-4 text-destructive">No entity configured for this page.</div>;
  }

  if (isLiveLoading) {
    return <ListLoadingSkeleton />;
  }

  const filteredTotal = afterSort.length;

  // ---- URL updaters ----

  function updateParams(updates: Record<string, string | null>) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(updates)) {
          if (v == null || v === '') {
            next.delete(k);
          } else {
            next.set(k, v);
          }
        }
        return next;
      },
      { replace: true },
    );
  }

  function handleSortChange(sort: { field: string; direction: 'asc' | 'desc' } | null) {
    updateParams({ sort: sort ? `${sort.field}_${sort.direction}` : null, page: '1' });
  }

  function handlePageChange(p: number) {
    updateParams({ page: String(p) });
  }

  function handlePageSizeChange(ps: number) {
    updateParams({ pageSize: String(ps), page: '1' });
  }

  function setFilter(key: string, value: string | null) {
    updateParams({ [`filter_${key}`]: value, page: '1' });
  }

  function clearAllFilters() {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('search');
        next.delete('page');
        filterableFields.forEach((f) => next.delete(`filter_${f.key}`));
        setSearchInput('');
        return next;
      },
      { replace: true },
    );
  }

  // ---- active chip state ----
  const hasActiveSearch = Boolean(searchParam);
  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const hasActiveNarrow = hasActiveSearch || hasActiveFilters;
  const hasAnyData = allRows.length > 0;

  const activeChips: Array<{ key: string; label: string }> = [
    ...(hasActiveSearch ? [{ key: 'search', label: `Search: "${searchParam}"` }] : []),
    ...Object.entries(activeFilters).map(([k, v]) => {
      const field = listFields.find((f) => f.key === k);
      return { key: `filter_${k}`, label: `${field?.name ?? k}: ${v}` };
    }),
  ];

  function clearChip(chipKey: string) {
    if (chipKey === 'search') {
      setSearchInput('');
      updateParams({ search: null, page: '1' });
    } else if (chipKey.startsWith('filter_')) {
      const fieldKey = chipKey.slice(7);
      setFilter(fieldKey, null);
    }
  }

  // ---- filter controls ----
  const filterControls =
    filterableFields.length > 0 ? (
      <>
        {filterableFields.map((f) => {
          if (f.type === 'boolean') {
            return (
              <select
                key={f.key}
                value={activeFilters[f.key] ?? ''}
                onChange={(e) => setFilter(f.key, e.target.value || null)}
                className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">All {f.name}</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            );
          }
          // enum
          return (
            <select
              key={f.key}
              value={activeFilters[f.key] ?? ''}
              onChange={(e) => setFilter(f.key, e.target.value || null)}
              className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">All {f.name}</option>
              {(f.enumValues ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          );
        })}
      </>
    ) : null;

  // ---- render ----
  return (
    <>
      <ListPageLayout
        title={page.title}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            Create {resolvedEntity.name}
          </button>
        }
        filterStart={
          <SearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={`Search ${resolvedEntity.pluralName.toLowerCase()}`}
            className="w-64"
          />
        }
        filterEnd={filterControls}
        pagination={
          <PaginationControls
            page={pageParam}
            pageSize={effectivePageSize}
            total={filteredTotal}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        }
      >
        {hasActiveNarrow && (
          <div className="flex flex-wrap items-center gap-2 py-2">
            {activeChips.map((chip) => (
              <span key={chip.key} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs">
                {chip.label}
                <button
                  type="button"
                  onClick={() => clearChip(chip.key)}
                  aria-label={`Clear ${chip.label}`}
                  className="ml-0.5 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </span>
            ))}
            <button type="button" onClick={clearAllFilters} className="text-xs text-muted-foreground hover:underline">
              Clear all
            </button>
          </div>
        )}

        <CellDataGrid
          columns={gridColumns}
          rows={paginatedRows}
          sort={parseSortParam(sortParam)}
          onSortChange={handleSortChange}
          getDetailHref={getDetailHref}
          getRowId={(row) => String(row['id'] ?? '')}
          emptyTitle={
            hasAnyData ? `No ${resolvedEntity.pluralName} match your search` : `No ${resolvedEntity.pluralName} yet`
          }
          emptyDescription={hasAnyData ? 'Try clearing your search or filters.' : undefined}
          emptyAction={
            hasAnyData ? (
              <button type="button" onClick={clearAllFilters} className="text-sm text-muted-foreground hover:underline">
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                Create the first one
              </button>
            )
          }
        />
      </ListPageLayout>

      <EntityCreateSheet entityKey={resolvedEntity.key} open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
