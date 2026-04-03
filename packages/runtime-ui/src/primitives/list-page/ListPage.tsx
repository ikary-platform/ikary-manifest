import type { ReactNode } from 'react';
import { BulkCommandBar } from '../bulk-command-bar';
import { CardList } from '../card-list';
import { DataGrid } from '../data-grid';
import { FilterBar } from '../filter-bar';
import { PageHeader } from '../page-header';
import { Pagination } from '../pagination';
import { Tabs } from '../tabs';
import { RenderStateBoundary } from '../../runtime/RenderStateBoundary';
import type { RenderState } from '../../runtime/render-state.types';
import type { FilterBarViewProps } from '../filter-bar';
import type {
  ListPageBulkAction,
  ListPageControlsView,
  ListPageEmptyStateView,
  ListPageRendererView,
  ListPageViewProps,
} from './ListPage.types';

export function ListPage({
  header,
  navigation,
  controls,
  renderer,
  pagination,
  emptyState,
  loading = false,
  errorState,
  dense = false,
}: ListPageViewProps) {
  const filterBar = controls
    ? buildQueryFilterBar({
        controls,
        dense,
      })
    : undefined;

  const bulkCommandBar = controls
    ? buildBulkCommandBar({
        controls,
        dense,
      })
    : undefined;

  const renderState = resolveListPageRenderState({
    renderer,
    loading,
    errorState,
    emptyState,
    dense,
  });
  const hasBlockingError = renderState?.kind === 'error';

  return (
    <div className="space-y-4">
      {header && <PageHeader {...header} />}

      {navigation && (
        <div className="px-4 sm:px-6">
          <Tabs {...navigation} />
        </div>
      )}

      {filterBar && (
        <div className="px-4 sm:px-6">
          <FilterBar {...filterBar} />
        </div>
      )}

      {bulkCommandBar && (
        <div className="px-4 sm:px-6">
          <BulkCommandBar {...bulkCommandBar} />
        </div>
      )}

      <div className="px-4 sm:px-6">
        <RenderStateBoundary state={renderState}>{renderRenderer(renderer)}</RenderStateBoundary>
      </div>

      {!hasBlockingError && pagination && (
        <div className="px-4 sm:px-6">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}

function renderRenderer(renderer: ListPageRendererView) {
  if (renderer.mode === 'data-grid') {
    return <DataGrid {...renderer.props} />;
  }

  return <CardList {...renderer.props} />;
}

function buildQueryFilterBar(input: {
  controls: ListPageControlsView;
  dense: boolean;
}): FilterBarViewProps | undefined {
  const searchVisible = input.controls.search?.visible ?? false;
  const filterVisible = input.controls.filters?.visible ?? false;
  const sortingVisible = input.controls.sorting?.visible ?? false;

  const search = searchVisible ? input.controls.search : undefined;

  const activeFilters = [
    ...(filterVisible ? toActiveFilters(input.controls.filters?.items ?? []) : []),
    ...(sortingVisible && input.controls.sorting?.label
      ? [
          {
            key: 'sorting',
            label: 'Sort',
            valueLabel: input.controls.sorting.label,
          },
        ]
      : []),
  ];

  if (!search && activeFilters.length === 0) {
    return undefined;
  }

  const hasSearchValue = search ? search.value.trim().length > 0 : false;

  return {
    variant: 'list',
    density: input.dense ? 'compact' : 'comfortable',
    loading: false,
    search: search
      ? {
          value: search.value,
          placeholder: search.placeholder ?? 'Search',
          disabled: false,
        }
      : undefined,
    activeFilters: activeFilters.length > 0 ? activeFilters : undefined,
    clearAction:
      search && hasSearchValue
        ? {
            label: 'Clear search',
            onClick: () => search.onChange(''),
          }
        : undefined,
    onSearchChange: search?.onChange,
  };
}

function toActiveFilters(items: Array<{ key: string; label: string }>) {
  return items.map((item) => {
    const separatorIndex = item.label.indexOf(':');

    if (separatorIndex > 0) {
      const label = item.label.slice(0, separatorIndex).trim();
      const valueLabel = item.label.slice(separatorIndex + 1).trim();

      if (label.length > 0 && valueLabel.length > 0) {
        return {
          key: item.key,
          label,
          valueLabel,
        };
      }
    }

    return {
      key: item.key,
      label: 'Filter',
      valueLabel: item.label,
    };
  });
}

function buildBulkCommandBar(input: { controls: ListPageControlsView; dense: boolean }) {
  const bulkActions = input.controls.bulkActions;
  if (!bulkActions?.visible) {
    return undefined;
  }

  const hasBulkActions = bulkActions.actions.length > 0 || (bulkActions.overflowActions?.length ?? 0) > 0;

  if (!hasBulkActions) {
    return undefined;
  }

  const selectedCount = bulkActions.selectedCount !== undefined ? Math.max(0, bulkActions.selectedCount) : 1;

  return {
    variant: 'list' as const,
    density: input.dense ? ('compact' as const) : ('comfortable' as const),
    selectedCount,
    scope: bulkActions.scope ?? 'page',
    summaryLabel: bulkActions.summaryLabel,
    actions: bulkActions.actions.map(toBulkCommandBarAction),
    overflowActions: bulkActions.overflowActions?.map(toBulkCommandBarAction) ?? [],
    clearSelectionAction: bulkActions.clearSelectionAction,
    selectAllResultsAction: bulkActions.selectAllResultsAction,
  };
}

function resolveListPageRenderState(input: {
  renderer: ListPageRendererView;
  loading: boolean;
  errorState?: ReactNode;
  emptyState?: ListPageEmptyStateView;
  dense: boolean;
}): RenderState | undefined {
  const rendererLoading = input.loading || input.renderer.props.loading === true;

  if (input.errorState !== undefined && input.errorState !== null) {
    return toErrorRenderState(input.errorState);
  }

  if (rendererLoading) {
    return {
      kind: 'loading',
      state: {
        variant: 'section',
        density: input.dense ? 'compact' : 'comfortable',
        mode: 'skeleton',
        label: 'Loading results',
      },
    };
  }

  if (isRendererEmpty(input.renderer)) {
    return {
      kind: 'empty',
      state: {
        title: input.emptyState?.title ?? 'No items found',
        description: input.emptyState?.description,
        variant: 'section',
        density: input.dense ? 'compact' : 'comfortable',
      },
    };
  }

  return undefined;
}

function isRendererEmpty(renderer: ListPageRendererView): boolean {
  if (renderer.mode === 'data-grid') {
    return renderer.props.rows.length === 0;
  }

  return renderer.props.items.length === 0;
}

function toErrorRenderState(errorState: ReactNode): RenderState {
  if (typeof errorState === 'string' && errorState.trim().length > 0) {
    return {
      kind: 'error',
      state: {
        title: errorState,
        variant: 'section',
        severity: 'soft',
      },
    };
  }

  if (typeof errorState === 'number') {
    return {
      kind: 'error',
      state: {
        title: String(errorState),
        variant: 'section',
        severity: 'soft',
      },
    };
  }

  return {
    kind: 'error',
    state: {
      title: 'Unable to load content',
      description: 'Please retry in a moment.',
      variant: 'section',
      severity: 'soft',
    },
  };
}

function toBulkCommandBarAction(action: ListPageBulkAction) {
  return {
    key: action.key,
    label: action.label,
    disabled: action.disabled,
    onClick: action.onClick,
    variant: action.intent === 'danger' ? 'destructive' : action.intent === 'neutral' ? 'secondary' : 'default',
  } as const;
}
