import type { ListPagePresentation } from '@ikary/presentation';
import { buildPageHeaderViewModel, type BuildPageHeaderViewModelInput } from '../page-header';
import { buildTabsViewModel, type BuildTabsViewModelInput } from '../tabs';
import { buildDataGridViewModel, type BuildDataGridViewModelInput } from '../data-grid';
import { buildCardListViewModel, type BuildCardListViewModelInput } from '../card-list';
import { buildPaginationViewModel, type BuildPaginationViewModelInput } from '../pagination';
import type {
  ListPageBulkAction,
  ListPageControlsView,
  ListPageRendererView,
  ListPageViewProps,
} from './ListPage.types';

type CardRecord = Record<string, unknown>;

type PageHeaderRuntime = Omit<BuildPageHeaderViewModelInput, 'presentation'>;
type TabsRuntime = Omit<BuildTabsViewModelInput, 'presentation'>;
type PaginationRuntime = Omit<BuildPaginationViewModelInput, 'presentation'>;

type DataGridRendererRuntime<TRecord extends CardRecord = CardRecord> = Omit<
  BuildDataGridViewModelInput<TRecord>,
  'presentation'
>;

type CardListRendererRuntime<TRecord extends CardRecord = CardRecord> = Omit<
  BuildCardListViewModelInput<TRecord>,
  'presentation'
>;

export type BuildListPageViewModelInput<TRecord extends CardRecord = CardRecord> = {
  presentation: ListPagePresentation;

  headerRuntime?: PageHeaderRuntime;
  navigationRuntime?: TabsRuntime;
  paginationRuntime?: PaginationRuntime;

  rendererRuntime: DataGridRendererRuntime<TRecord> | CardListRendererRuntime<TRecord>;

  controlsRuntime?: {
    searchValue?: string;
    onSearchChange?: (value: string) => void;

    sortingLabel?: string;

    bulkActions?: ListPageBulkAction[];
    bulkOverflowActions?: ListPageBulkAction[];
    bulkActionsVisible?: boolean;
    bulkSelectedCount?: number;
    bulkScope?: 'page' | 'all-results';
    bulkSummaryLabel?: string;
    onClearSelection?: () => void;
    clearSelectionLabel?: string;
    onSelectAllResults?: () => void;
    selectAllResultsLabel?: string;
  };

  loading?: boolean;
  errorState?: React.ReactNode;
};

export function buildListPageViewModel<TRecord extends CardRecord = CardRecord>(
  input: BuildListPageViewModelInput<TRecord>,
): ListPageViewProps {
  return {
    header: input.presentation.header
      ? buildPageHeaderViewModel({
          presentation: input.presentation.header,
          ...(input.headerRuntime ?? {}),
        })
      : undefined,

    navigation: input.presentation.navigation
      ? buildTabsViewModel({
          presentation: input.presentation.navigation,
          ...(input.navigationRuntime ?? {}),
        })
      : undefined,

    controls: resolveControls(input),

    renderer: resolveRenderer(input),

    pagination:
      input.presentation.pagination && input.paginationRuntime
        ? buildPaginationViewModel({
            presentation: input.presentation.pagination,
            ...input.paginationRuntime,
          })
        : undefined,

    emptyState: input.presentation.emptyState,
    loading: input.loading,
    errorState: input.errorState,
    dense: input.presentation.dense ?? false,
  };
}

function resolveControls<TRecord extends CardRecord = CardRecord>(
  input: BuildListPageViewModelInput<TRecord>,
): ListPageControlsView | undefined {
  const controls = input.presentation.controls;
  if (!controls) return undefined;

  const runtime = input.controlsRuntime;
  const view: ListPageControlsView = {};

  if (controls.search) {
    view.search = {
      visible: controls.search.visible ?? true,
      placeholder: controls.search.placeholder,
      value: runtime?.searchValue ?? '',
      onChange: runtime?.onSearchChange ?? (() => undefined),
    };
  }

  if (controls.filters) {
    view.filters = {
      visible: controls.filters.visible ?? true,
      mode: controls.filters.mode,
      items: controls.filters.items ?? [],
    };
  }

  if (controls.sorting) {
    view.sorting = {
      visible: controls.sorting.visible ?? true,
      mode: controls.sorting.mode,
      label: runtime?.sortingLabel,
    };
  }

  if (controls.bulkActions) {
    const actions = runtime?.bulkActions ?? [];
    view.bulkActions = {
      visible:
        runtime?.bulkActionsVisible ?? ((controls.bulkActions.visibleWhenSelection ?? true) && actions.length > 0),
      selectedCount: runtime?.bulkSelectedCount,
      scope: runtime?.bulkScope,
      summaryLabel: runtime?.bulkSummaryLabel,
      actions,
      overflowActions: runtime?.bulkOverflowActions,
      clearSelectionAction: runtime?.clearSelectionLabel
        ? {
            label: runtime.clearSelectionLabel,
            onClick: runtime.onClearSelection,
            disabled: typeof runtime.onClearSelection !== 'function',
          }
        : undefined,
      selectAllResultsAction: runtime?.selectAllResultsLabel
        ? {
            label: runtime.selectAllResultsLabel,
            onClick: runtime.onSelectAllResults,
            disabled: typeof runtime.onSelectAllResults !== 'function',
          }
        : undefined,
    };
  }

  return view;
}

function resolveRenderer<TRecord extends CardRecord = CardRecord>(
  input: BuildListPageViewModelInput<TRecord>,
): ListPageRendererView {
  if (input.presentation.renderer.mode === 'data-grid') {
    return {
      mode: 'data-grid',
      props: buildDataGridViewModel({
        presentation: input.presentation.renderer.presentation,
        ...(input.rendererRuntime as DataGridRendererRuntime<TRecord>),
      }),
    };
  }

  return {
    mode: 'card-list',
    props: buildCardListViewModel({
      presentation: input.presentation.renderer.presentation,
      ...(input.rendererRuntime as CardListRendererRuntime<TRecord>),
    }),
  };
}
