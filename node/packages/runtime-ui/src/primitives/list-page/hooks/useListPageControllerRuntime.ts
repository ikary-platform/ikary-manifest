import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useRuntimeContext } from '../../../context/RuntimeContextProvider';
import { runAction } from '../../../registry/actionRegistry';
import { useEntityList } from '../../../query/hooks/useEntityList';
import type { ListParams } from '../../../query/shared/list';
import type { ActionDefinition, RenderedAction } from '../../../types/ActionTypes';
import type { DataGridViewSort } from '../../data-grid';
import type { ListPagePresentation } from '@ikary-manifest/presentation';
import type { ListPageResolverRuntime } from '../ListPage.resolver';
// import type { ListPageBulkAction } from './ListPage.types'

/**
 * Keep these helpers extracted from the old ListPage implementation.
 * Do NOT re-implement them here if they already exist elsewhere.
 */
import {
  SEARCH_DEBOUNCE_MS,
  buildFilterGroup,
  deriveDefaultFilters,
  deriveDefaultSearchableFields,
  interpolateParams,
  isBrowser,
  normalizeFilters,
  parseRouteState,
  writeRouteState,
} from '../listPage.runtime-utils';

type RowRecord = Record<string, unknown>;
type SortDirection = 'asc' | 'desc';
type ListPageView = 'grid' | 'cards';
type ListPageRenderer = 'grid' | 'cards' | 'switchable';

type ListPageEventName =
  | 'list_view_loaded'
  | 'list_search_changed'
  | 'list_filter_changed'
  | 'list_sort_changed'
  | 'list_page_changed'
  | 'list_page_size_changed'
  | 'list_view_mode_changed'
  | 'list_bulk_selection_changed'
  | 'list_bulk_action_triggered'
  | 'list_item_opened';

type ListPageEventPayload = {
  route: string;
  workspaceId?: string;
  cellId?: string;
  entityType: string;
  rendererType: ListPageView;
  page: number;
  pageSize: number;
  searchQueryPresent: boolean;
  activeFilterCount: number;
  sortField?: string;
  sortDirection?: SortDirection;
  selectedCount: number;
  resultCount: number;
};

type ListPageFilterOption = {
  label: string;
  value: string;
};

type ListPageFilterDefinition = {
  key: string;
  label?: string;
  field?: string;
  type?: 'text' | 'select' | 'boolean';
  options?: ListPageFilterOption[];
};

type ListPageActionConfig = {
  label: string;
  action: ActionDefinition;
  requiredPermission?: string;
};

type ListPageColumn = {
  key: string;
  label: string;
  type?: string;
  sortable?: boolean;
  align?: 'start' | 'center' | 'end';
  minWidth?: number;
  width?: number | 'auto' | 'content';
  hidden?: boolean;
};

type ListPageRouteState = {
  q: string;
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: SortDirection;
  view: ListPageView;
  filters: Record<string, string>;
};

export type UseListPageRuntimeInput = {
  presentation: ListPagePresentation;

  entity?: string;
  cellId?: string;

  /**
   * Old list-page runtime config preserved here because this is still the controller layer.
   */
  renderer?: ListPageRenderer;
  defaultView?: ListPageView;

  columns?: ListPageColumn[];
  searchableFields?: string[];
  sortableFields?: string[];
  filters?: ListPageFilterDefinition[];

  defaultPageSize?: number;
  pageSizeOptions?: number[];

  pageActions?: ListPageActionConfig[];
  bulkActions?: ListPageActionConfig[];
  itemActions?: ListPageActionConfig[];
  onItemOpen?: ActionDefinition;

  emptyTitle?: string;
  emptyDescription?: string;
  noResultsTitle?: string;
  noResultsDescription?: string;

  onEvent?: (name: ListPageEventName, payload: ListPageEventPayload) => void;

  /**
   * Actions coming from the rendered block.
   */
  actions?: RenderedAction[];

  /**
   * Optional mapping functions for new renderer pipeline.
   */
  buildRendererRuntime: (input: {
    rows: RowRecord[];
    selectedRowIds: string[];
    setSelectedRowIds: (ids: string[]) => void;
    sort: DataGridViewSort;
    onSortChange: (field: string, direction: 'asc' | 'desc') => void;
    onRowOpen: (row: RowRecord) => Promise<void> | void;
    visibleItemActions: ListPageActionConfig[];
  }) => ListPageResolverRuntime<RowRecord>['rendererRuntime'];
};

export type UseListPageRuntimeResult = {
  runtime: ListPageResolverRuntime<RowRecord>;
  query: {
    rows: RowRecord[];
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    error: ReactNode;
    showNoResults: boolean;
  };
  state: {
    routeState: ListPageRouteState;
    searchInput: string;
    selectedIds: string[];
  };
  actions: {
    setSearchInput: (value: string) => void;
    clearSearchAndFilters: () => void;
    handleFilterChange: (key: string, value: string) => void;
    clearFilter: (key: string) => void;
    handlePageAction: (action: ListPageActionConfig) => Promise<void>;
    handleBulkAction: (action: ListPageActionConfig) => Promise<void>;
    handleItemOpen: (row: RowRecord) => Promise<void>;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    setSelectedIds: (ids: string[]) => void;
    updateRouteState: (
      updater: Partial<ListPageRouteState> | ((prev: ListPageRouteState) => ListPageRouteState),
      options?: { resetPage?: boolean },
    ) => void;
  };
};

export function useListPageRuntime(input: UseListPageRuntimeInput): UseListPageRuntimeResult {
  const context = useRuntimeContext();

  const listEntity = input.entity ?? context.entity.key;
  const renderer = input.renderer ?? 'grid';
  const defaultView: ListPageView = input.defaultView ?? (renderer === 'cards' ? 'cards' : 'grid');
  const defaultPageSize = input.defaultPageSize ?? 25;
  const pageSizeOptions = input.pageSizeOptions ?? [10, 25, 50, 100];

  /**
   * Keep this aligned with your new column derivation / DataGrid presentation.
   * For now we still accept old `columns` input because this hook is the migration bridge.
   */
  const resolvedColumns = useMemo(() => input.columns ?? [], [input.columns]);

  const resolvedSearchableFields = useMemo(
    () =>
      input.searchableFields && input.searchableFields.length > 0
        ? input.searchableFields
        : deriveDefaultSearchableFields(listEntity, context.entity.key, context.entity.fields),
    [input.searchableFields, listEntity, context.entity.key, context.entity.fields],
  );

  const defaultFilterDefinitions = useMemo(
    () => deriveDefaultFilters(listEntity, context.entity.key, context.entity.fields),
    [listEntity, context.entity.key, context.entity.fields],
  );

  const filterDefinitions = input.filters && input.filters.length > 0 ? input.filters : defaultFilterDefinitions;

  const filterDefinitionMap = useMemo(
    () => Object.fromEntries(filterDefinitions.map((definition) => [definition.key, definition])),
    [filterDefinitions],
  );

  const allowedFilterKeys = useMemo(
    () => new Set(filterDefinitions.map((definition) => definition.key)),
    [filterDefinitions],
  );

  const resolvedSortableFields = useMemo(() => {
    if (input.sortableFields && input.sortableFields.length > 0) {
      return input.sortableFields;
    }

    return resolvedColumns.filter((column) => column.sortable !== false).map((column) => column.key);
  }, [input.sortableFields, resolvedColumns]);

  const allowedSortFields = useMemo(
    () => (resolvedSortableFields.length > 0 ? new Set(resolvedSortableFields) : undefined),
    [resolvedSortableFields],
  );

  const routeParserOptions = useMemo(
    () => ({
      renderer,
      defaultView,
      defaultPageSize,
      pageSizeOptions,
      allowedSortFields,
      allowedFilterKeys,
    }),
    [renderer, defaultView, defaultPageSize, pageSizeOptions, allowedSortFields, allowedFilterKeys],
  );

  const readRouteState = useCallback(
    () => parseRouteState(isBrowser() ? window.location.search : '', routeParserOptions),
    [routeParserOptions],
  );

  const [routeState, setRouteState] = useState<ListPageRouteState>(() => readRouteState());
  const [searchInput, setSearchInput] = useState(routeState.q);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const emit = useCallback(
    (name: ListPageEventName, patch?: Partial<ListPageEventPayload>) => {
      const route = isBrowser() ? `${window.location.pathname}${window.location.search}` : '';

      const payload: ListPageEventPayload = {
        route,
        workspaceId: context.workspaceId,
        cellId: input.cellId,
        entityType: listEntity,
        rendererType: routeState.view,
        page: routeState.page,
        pageSize: routeState.pageSize,
        searchQueryPresent: Boolean(routeState.q),
        activeFilterCount: Object.keys(routeState.filters).length,
        sortField: routeState.sortField,
        sortDirection: routeState.sortDirection,
        selectedCount: selectedIds.length,
        resultCount: 0,
        ...patch,
      };

      input.onEvent?.(name, payload);

      if (isBrowser()) {
        window.dispatchEvent(
          new CustomEvent('ikary.list_page.event', {
            detail: { name, payload },
          }),
        );
      }
    },
    [
      context.workspaceId,
      input.cellId,
      listEntity,
      routeState.view,
      routeState.page,
      routeState.pageSize,
      routeState.q,
      routeState.filters,
      routeState.sortField,
      routeState.sortDirection,
      selectedIds.length,
      input.onEvent,
    ],
  );

  const updateRouteState = useCallback(
    (
      updater: Partial<ListPageRouteState> | ((prev: ListPageRouteState) => ListPageRouteState),
      options?: { resetPage?: boolean },
    ) => {
      setRouteState((prev) => {
        const nextCandidate = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };

        const next: ListPageRouteState = {
          ...nextCandidate,
          page: Math.max(1, Math.floor(nextCandidate.page)),
          pageSize: Math.max(1, Math.floor(nextCandidate.pageSize)),
          filters: normalizeFilters(nextCandidate.filters, allowedFilterKeys),
        };

        if (options?.resetPage) {
          next.page = 1;
        }

        if (allowedSortFields && next.sortField && !allowedSortFields.has(next.sortField)) {
          next.sortField = undefined;
          next.sortDirection = undefined;
        }

        if (renderer !== 'switchable') {
          next.view = renderer === 'cards' ? 'cards' : 'grid';
        }

        if (pageSizeOptions.length > 0 && !pageSizeOptions.includes(next.pageSize)) {
          next.pageSize = defaultPageSize;
        }

        writeRouteState(next);
        return next;
      });
    },
    [allowedFilterKeys, allowedSortFields, renderer, pageSizeOptions, defaultPageSize],
  );

  useEffect(() => {
    if (!isBrowser()) return undefined;

    const onPopState = () => {
      setRouteState(readRouteState());
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [readRouteState]);

  useEffect(() => {
    setSearchInput(routeState.q);
  }, [routeState.q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (searchInput === routeState.q) return;

      updateRouteState((prev) => ({ ...prev, q: searchInput }), { resetPage: true });
      emit('list_search_changed');
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [searchInput, routeState.q, updateRouteState, emit]);

  const filterGroup = useMemo(
    () => buildFilterGroup(routeState.filters, filterDefinitionMap, routeState.q, resolvedSearchableFields),
    [routeState.filters, routeState.q, filterDefinitionMap, resolvedSearchableFields],
  );

  const listParams = useMemo<ListParams>(
    () => ({
      entity: listEntity,
      filter: filterGroup,
      sort: routeState.sortField
        ? [{ field: routeState.sortField, direction: routeState.sortDirection ?? 'asc' }]
        : undefined,
      page: routeState.page,
      pageSize: routeState.pageSize,
      fields: resolvedColumns.map((column) => column.key),
    }),
    [
      listEntity,
      filterGroup,
      routeState.sortField,
      routeState.sortDirection,
      routeState.page,
      routeState.pageSize,
      resolvedColumns,
    ],
  );

  const listQuery = useEntityList<RowRecord>(listParams);
  const baselineQuery = useEntityList<RowRecord>({
    entity: listEntity,
    page: 1,
    pageSize: 1,
  });

  const rows = useMemo(() => listQuery.data?.items ?? [], [listQuery.data?.items]);

  const totalItems = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / routeState.pageSize));

  const hasQueryNarrowing = routeState.q.length > 0 || Object.keys(routeState.filters).length > 0;

  const hasBaseRecords = (baselineQuery.data?.total ?? 0) > 0;

  const showNoResults =
    !listQuery.isLoading &&
    !listQuery.error &&
    rows.length === 0 &&
    hasQueryNarrowing &&
    !baselineQuery.isLoading &&
    hasBaseRecords;

  useEffect(() => {
    if (totalItems > 0 && routeState.page > totalPages) {
      updateRouteState((prev) => ({ ...prev, page: totalPages }));
    }
  }, [routeState.page, totalPages, totalItems, updateRouteState]);

  const rowIds = useMemo(() => rows.map((row) => String(row.id ?? '')), [rows]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => rowIds.includes(id)));
  }, [rowIds]);

  const selectionEventReady = useRef(false);
  useEffect(() => {
    if (!selectionEventReady.current) {
      selectionEventReady.current = true;
      return;
    }

    emit('list_bulk_selection_changed', { resultCount: rows.length });
  }, [selectedIds, rows.length, emit]);

  const loadEventReady = useRef(false);
  useEffect(() => {
    if (listQuery.isLoading || listQuery.error) return;

    if (!loadEventReady.current) {
      loadEventReady.current = true;
    }

    emit('list_view_loaded', { resultCount: rows.length });
  }, [listQuery.isLoading, listQuery.error, rows.length, emit]);

  const hasPermission = useCallback(
    (requiredPermission?: string): boolean => {
      if (!requiredPermission) return true;
      if (!context.permissions || context.permissions.length === 0) return true;
      return context.permissions.includes(requiredPermission);
    },
    [context.permissions],
  );

  const implicitPageActions = useMemo<ListPageActionConfig[]>(
    () =>
      input.actions?.map((action) => ({
        label: action.label,
        action: action.action,
      })) ?? [],
    [input.actions],
  );

  const visiblePageActions = useMemo(
    () => (input.pageActions ?? implicitPageActions).filter((action) => hasPermission(action.requiredPermission)),
    [input.pageActions, implicitPageActions, hasPermission],
  );

  const visibleBulkActions = useMemo(
    () => (input.bulkActions ?? []).filter((action) => hasPermission(action.requiredPermission)),
    [input.bulkActions, hasPermission],
  );

  const visibleItemActions = useMemo(
    () => (input.itemActions ?? []).filter((action) => hasPermission(action.requiredPermission)),
    [input.itemActions, hasPermission],
  );

  const runInterpolatedAction = useCallback(
    async (action: ActionDefinition, row: RowRecord, extra: Record<string, unknown> = {}) => {
      const params = interpolateParams(action.params, row, extra);
      await runAction(context, { ...action, params });
    },
    [context],
  );

  const handlePageAction = useCallback(
    async (action: ListPageActionConfig) => {
      await runAction(context, action.action);
    },
    [context],
  );

  const handleBulkAction = useCallback(
    async (action: ListPageActionConfig) => {
      await runAction(context, {
        ...action.action,
        params: {
          ...(action.action.params ?? {}),
          selectedIds,
          entity: listEntity,
        },
      });

      emit('list_bulk_action_triggered', { resultCount: rows.length });
    },
    [context, selectedIds, listEntity, emit, rows.length],
  );

  const handleItemOpen = useCallback(
    async (row: RowRecord) => {
      if (input.onItemOpen) {
        await runInterpolatedAction(input.onItemOpen, row);
      } else {
        const id = String(row.id ?? '');
        if (id) {
          context.actions.navigate(`/${listEntity}/${id}`);
        }
      }

      emit('list_item_opened', { resultCount: rows.length });
    },
    [context.actions, listEntity, input.onItemOpen, runInterpolatedAction, emit, rows.length],
  );

  const handleSortChange = useCallback(
    (field: string, direction: SortDirection) => {
      updateRouteState((prev) => ({
        ...prev,
        sortField: field,
        sortDirection: direction,
      }));
      emit('list_sort_changed', { resultCount: rows.length });
    },
    [updateRouteState, emit, rows.length],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      updateRouteState(
        (prev) => ({
          ...prev,
          filters: {
            ...prev.filters,
            [key]: value,
          },
        }),
        { resetPage: true },
      );
      emit('list_filter_changed', { resultCount: rows.length });
    },
    [updateRouteState, emit, rows.length],
  );

  const clearFilter = useCallback(
    (key: string) => {
      updateRouteState(
        (prev) => {
          const nextFilters = { ...prev.filters };
          delete nextFilters[key];
          return { ...prev, filters: nextFilters };
        },
        { resetPage: true },
      );
      emit('list_filter_changed', { resultCount: rows.length });
    },
    [updateRouteState, emit, rows.length],
  );

  const clearSearchAndFilters = useCallback(() => {
    setSearchInput('');
    updateRouteState((prev) => ({ ...prev, q: '', filters: {} }), { resetPage: true });
  }, [updateRouteState]);

  const setPage = useCallback(
    (page: number) => {
      updateRouteState((prev) => ({ ...prev, page: Math.max(1, page) }));
      emit('list_page_changed', { resultCount: rows.length });
    },
    [updateRouteState, emit, rows.length],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      updateRouteState((prev) => ({ ...prev, pageSize }), { resetPage: true });
      emit('list_page_size_changed', { resultCount: rows.length });
    },
    [updateRouteState, emit, rows.length],
  );

  const rendererRuntime = useMemo(
    () =>
      input.buildRendererRuntime({
        rows,
        selectedRowIds: selectedIds,
        setSelectedRowIds: setSelectedIds,
        sort: {
          field: routeState.sortField,
          direction: routeState.sortDirection,
        },
        onSortChange: handleSortChange,
        onRowOpen: handleItemOpen,
        visibleItemActions,
      }),
    [
      input,
      rows,
      selectedIds,
      routeState.sortField,
      routeState.sortDirection,
      handleSortChange,
      handleItemOpen,
      visibleItemActions,
    ],
  );

  const runtime = useMemo<ListPageResolverRuntime<RowRecord>>(
    () => ({
      headerRuntime: input.presentation.header
        ? {
            actionHandlers: Object.fromEntries(
              visiblePageActions
                .filter((action) => action.action.type)
                .map((action) => [action.action.type, () => void handlePageAction(action)]),
            ),
          }
        : undefined,

      navigationRuntime: undefined,

      rendererRuntime,

      paginationRuntime: input.presentation.pagination
        ? {
            page: routeState.page,
            pageSize: routeState.pageSize,
            totalItems,
            totalPages,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }
        : undefined,

      controlsRuntime: {
        searchValue: searchInput,
        onSearchChange: setSearchInput,
        sortingLabel:
          routeState.sortField && routeState.sortDirection
            ? `Sorted by ${routeState.sortField} (${routeState.sortDirection})`
            : undefined,
        bulkActions: visibleBulkActions.map((action) => ({
          key: action.action.type,
          label: action.label,
          onClick: () => void handleBulkAction(action),
        })),
        bulkActionsVisible: visibleBulkActions.length > 0 && selectedIds.length > 0,
        bulkSelectedCount: selectedIds.length,
        clearSelectionLabel: 'Clear selection',
        onClearSelection: () => {
          setSelectedIds([]);
        },
      },

      loading: listQuery.isLoading,
      errorState: listQuery.error
        ? String(listQuery.error instanceof Error ? listQuery.error.message : listQuery.error)
        : undefined,
    }),
    [
      input.presentation.header,
      input.presentation.pagination,
      visiblePageActions,
      rendererRuntime,
      routeState.page,
      routeState.pageSize,
      totalItems,
      totalPages,
      setPage,
      setPageSize,
      searchInput,
      routeState.sortField,
      routeState.sortDirection,
      visibleBulkActions,
      selectedIds.length,
      listQuery.isLoading,
      listQuery.error,
      handlePageAction,
      handleBulkAction,
    ],
  );

  return {
    runtime,
    query: {
      rows,
      totalItems,
      totalPages,
      isLoading: listQuery.isLoading,
      error: listQuery.error
        ? String(listQuery.error instanceof Error ? listQuery.error.message : listQuery.error)
        : undefined,
      showNoResults,
    },
    state: {
      routeState,
      searchInput,
      selectedIds,
    },
    actions: {
      setSearchInput,
      clearSearchAndFilters,
      handleFilterChange,
      clearFilter,
      handlePageAction,
      handleBulkAction,
      handleItemOpen,
      setPage,
      setPageSize,
      setSelectedIds,
      updateRouteState,
    },
  };
}
