// ── Chrome (app-shell primitives, not manifest-driven) ───────────────────────
export { ThemeToggle, useTheme, THEME_PREFLIGHT_SCRIPT } from '@ikary/system-ikary-ui/ui';
export type { ThemeToggleProps, ThemeMode, UseThemeReturn } from '@ikary/system-ikary-ui/ui';

export type { PrimitiveComponent, UIPrimitiveDefinition } from './types/PrimitiveTypes';
export type { FieldBinding, ValueBinding, Binding } from './types/BindingTypes';
export type { EntityField, EntitySchema } from './types/EntityTypes';
export type { ActionDefinition, RenderedAction } from './types/ActionTypes';
export {
  registerPrimitive,
  registerPrimitiveVersion,
  setLatestPrimitive,
  getPrimitive,
  listPrimitives,
  listPrimitiveVersions,
  listAllPrimitiveVersions,
} from './registry/primitiveRegistry';
export { registerResolver, getResolver } from './registry/resolverRegistry';
export type { PrimitiveResolver, RuntimeContext } from './registry/resolverRegistry';
export { resolveValue, resolveBinding } from './resolver/resolveValue';
export { registerAction, getAction, listActions, runAction } from './registry/actionRegistry';
export type { ActionHandler } from './registry/actionRegistry';
export { PrimitiveRenderer } from './runtime/PrimitiveRenderer';
export { RenderStateBoundary } from './runtime/RenderStateBoundary';
export type {
  RenderState,
  RenderStateKind,
  LoadingRenderState,
  EmptyRenderState,
  ErrorRenderState,
} from './runtime/render-state.types';
export { renderLayout } from './runtime/renderLayout';
export type { LayoutBlock, RenderLayoutOptions, RenderLayoutProps } from './runtime/renderLayout';
export type { QueryDefinition, QueryResult } from './query/queryEngine';
export { runQuery } from './query/queryEngine';
export { useQuery } from './query/useQuery';
export { useQuerySingle } from './query/useQuerySingle';
export { useRuntimeContext, useRuntimeContextOptional, RuntimeContextProvider } from './context/RuntimeContextProvider';
export { DataGrid } from './primitives/data-grid/DataGrid';
export { DATA_GRID_PRESENTATION_EXAMPLE, DATA_GRID_RUNTIME_EXAMPLE } from './primitives/data-grid/DataGrid.example';
export type {
  DataGridProps,
  DataGridColumn,
  DataGridColumnType,
  DataGridSortState,
  DataGridPaginationState,
} from './primitives/data-grid/DataGrid';
export { Pagination } from './primitives/pagination/Pagination';
export {
  PAGINATION_PRESENTATION_EXAMPLE,
  PAGINATION_RUNTIME_EXAMPLE,
} from './primitives/pagination/Pagination.example';
export { PageHeader } from './primitives/page-header/PageHeader';
export {
  buildPageHeaderViewModel,
  type BuildPageHeaderViewModelInput,
} from './primitives/page-header/PageHeader.adapter';
export { resolvePageHeader, type PageHeaderResolverRuntime } from './primitives/page-header/PageHeader.resolver';
export type {
  PageHeaderActionIntent,
  PageHeaderBreadcrumb,
  PageHeaderLowerSlot,
  PageHeaderLowerSlotType,
  PageHeaderMetaItem,
  PageHeaderMetaTone,
  PageHeaderResolvedAction,
  PageHeaderViewProps,
} from './primitives/page-header/PageHeader.types';
export { ListPage } from './primitives/list-page/ListPage';
export { buildListPageViewModel, type BuildListPageViewModelInput } from './primitives/list-page/ListPage.adapter';
export { resolveListPage, type ListPageResolverRuntime } from './primitives/list-page/ListPage.resolver';
export type {
  ListPageBulkAction,
  ListPageControlsView,
  ListPageEmptyStateView,
  ListPageFilterItem,
  ListPageFiltersView,
  ListPageRendererView,
  ListPageSearchView,
  ListPageSortingView,
  ListPageViewProps,
} from './primitives/list-page/ListPage.types';
export {
  useListPageRuntime,
  type UseListPageRuntimeOptions,
  type UseListPageRuntimeResult,
} from './primitives/list-page/useListPageRuntime';
export { DetailPage } from './primitives/detail-page/DetailPage';
export {
  buildDetailPageViewModel,
  type BuildDetailPageViewModelInput,
} from './primitives/detail-page/DetailPage.adapter';
export { resolveDetailPage, type DetailPageResolverRuntime } from './primitives/detail-page/DetailPage.resolver';
export type {
  DetailPageActionVariant,
  DetailPageMetadataItemView,
  DetailPageMetadataKey,
  DetailPagePageRenderState,
  DetailPageResolvedAction,
  DetailPageTabKind,
  DetailPageTabView,
  DetailPageViewProps,
} from './primitives/detail-page/DetailPage.types';
export { DashboardPage } from './primitives/dashboard-page/DashboardPage';
export {
  buildDashboardPageViewModel,
  type BuildDashboardPageViewModelInput,
} from './primitives/dashboard-page/DashboardPage.adapter';
export {
  resolveDashboardPage,
  type DashboardPageResolverRuntime,
} from './primitives/dashboard-page/DashboardPage.resolver';
export type {
  DashboardPageActionVariant,
  DashboardPageDensity,
  DashboardPageResolvedAction,
  DashboardPageVariant,
  DashboardPageViewProps,
  DashboardWidgetResolvedAction,
  DashboardWidgetSize,
  DashboardWidgetView,
} from './primitives/dashboard-page/DashboardPage.types';
export { DetailItem } from './primitives/detail-item/DetailItem';
export {
  buildDetailItemViewModel,
  type BuildDetailItemViewModelInput,
} from './primitives/detail-item/DetailItem.adapter';
export type {
  DetailItemBadgeListViewProps,
  DetailItemBadgeView,
  DetailItemFieldValueKind,
  DetailItemFieldValueViewProps,
  DetailItemKind,
  DetailItemListSummaryViewProps,
  DetailItemReferenceView,
  DetailItemReferenceViewProps,
  DetailItemViewProps,
} from './primitives/detail-item/DetailItem.types';
export { EmptyState } from './primitives/empty-state/EmptyState';
export {
  buildEmptyStateViewModel,
  type BuildEmptyStateViewModelInput,
} from './primitives/empty-state/EmptyState.adapter';
export { resolveEmptyState, type EmptyStateResolverRuntime } from './primitives/empty-state/EmptyState.resolver';
export type {
  EmptyStateDensity,
  EmptyStateResolvedAction,
  EmptyStateVariant,
  EmptyStateViewProps,
} from './primitives/empty-state/EmptyState.types';
export { LoadingState } from './primitives/loading-state/LoadingState';
export {
  buildLoadingStateViewModel,
  type BuildLoadingStateViewModelInput,
} from './primitives/loading-state/LoadingState.adapter';
export {
  resolveLoadingState,
  type LoadingStateResolverRuntime,
} from './primitives/loading-state/LoadingState.resolver';
export type {
  LoadingStateDensity,
  LoadingStateMode,
  LoadingStateSkeletonView,
  LoadingStateVariant,
  LoadingStateViewProps,
} from './primitives/loading-state/LoadingState.types';
export { ErrorState } from './primitives/error-state/ErrorState';
export {
  buildErrorStateViewModel,
  type BuildErrorStateViewModelInput,
} from './primitives/error-state/ErrorState.adapter';
export { resolveErrorState, type ErrorStateResolverRuntime } from './primitives/error-state/ErrorState.resolver';
export type {
  ErrorStateResolvedAction,
  ErrorStateSeverity,
  ErrorStateTechnicalDetailsView,
  ErrorStateVariant,
  ErrorStateViewProps,
} from './primitives/error-state/ErrorState.types';
export { FilterBar } from './primitives/filter-bar/FilterBar';
export { buildFilterBarViewModel, type BuildFilterBarViewModelInput } from './primitives/filter-bar/FilterBar.adapter';
export { resolveFilterBar, type FilterBarResolverRuntime } from './primitives/filter-bar/FilterBar.resolver';
export type {
  FilterBarActiveFilterView,
  FilterBarAdvancedFiltersView,
  FilterBarClearActionView,
  FilterBarControlType,
  FilterBarDensity,
  FilterBarFilterView,
  FilterBarOptionView,
  FilterBarSearchView,
  FilterBarSortView,
  FilterBarVariant,
  FilterBarViewProps,
} from './primitives/filter-bar/FilterBar.types';
export { BulkCommandBar } from './primitives/bulk-command-bar/BulkCommandBar';
export {
  buildBulkCommandBarViewModel,
  type BuildBulkCommandBarViewModelInput,
} from './primitives/bulk-command-bar/BulkCommandBar.adapter';
export {
  resolveBulkCommandBar,
  type BulkCommandBarResolverRuntime,
} from './primitives/bulk-command-bar/BulkCommandBar.resolver';
export type {
  BulkCommandBarActionVariant,
  BulkCommandBarConfirmView,
  BulkCommandBarDensity,
  BulkCommandBarResolvedAction,
  BulkCommandBarResolvedUtilityAction,
  BulkCommandBarScope,
  BulkCommandBarVariant,
  BulkCommandBarViewProps,
} from './primitives/bulk-command-bar/BulkCommandBar.types';
export { Tabs } from './primitives/tabs/Tabs';
export { buildTabsViewModel, type BuildTabsViewModelInput } from './primitives/tabs/Tabs.adapter';
export { resolveTabs, type TabsResolverRuntime } from './primitives/tabs/Tabs.resolver';
export type {
  TabsOverflowMode,
  TabsResponsiveBreakpoint,
  TabsResolvedItem,
  TabsVariant,
  TabsViewProps,
} from './primitives/tabs/Tabs.types';
export { CardList } from './primitives/card-list/CardList';
export type {
  CardListActionIntent,
  CardListBadgeTone,
  CardListLayoutColumns,
  CardListResolvedAction,
  CardListResolvedBadge,
  CardListResolvedCard,
  CardListResolvedEmptyState,
  CardListResolvedField,
  CardListResolvedMetric,
  CardListValueType,
  CardListViewProps,
} from './primitives/card-list';
export { MetricCard } from './primitives/metric-card/MetricCard';
export {
  buildMetricCardViewModel,
  type BuildMetricCardViewModelInput,
} from './primitives/metric-card/MetricCard.adapter';
export { resolveMetricCard, type MetricCardResolverRuntime } from './primitives/metric-card/MetricCard.resolver';
export type {
  MetricCardDeltaDirection,
  MetricCardDensity,
  MetricCardResolvedAction,
  MetricCardTone,
  MetricCardVariant,
  MetricCardViewProps,
} from './primitives/metric-card/MetricCard.types';
export { ActivityFeed } from './primitives/activity-feed/ActivityFeed';
export {
  buildActivityFeedViewModel,
  type BuildActivityFeedViewModelInput,
} from './primitives/activity-feed/ActivityFeed.adapter';
export {
  resolveActivityFeed,
  type ActivityFeedResolverRuntime,
} from './primitives/activity-feed/ActivityFeed.resolver';
export type {
  ActivityFeedDensity,
  ActivityFeedResolvedAction,
  ActivityFeedResolvedItem,
  ActivityFeedTone,
  ActivityFeedVariant,
  ActivityFeedViewProps,
} from './primitives/activity-feed/ActivityFeed.types';
export { Input } from './primitives/input/Input';
export { buildInputViewModel, type BuildInputViewModelInput } from './primitives/input/Input.adapter';
export { resolveInput, type InputResolverRuntime } from './primitives/input/Input.resolver';
export type { InputType, InputValue, InputViewProps } from './primitives/input/Input.types';
export { Textarea } from './primitives/textarea/Textarea';
export { buildTextareaViewModel, type BuildTextareaViewModelInput } from './primitives/textarea/Textarea.adapter';
export { resolveTextarea, type TextareaResolverRuntime } from './primitives/textarea/Textarea.resolver';
export type { TextareaViewProps } from './primitives/textarea/Textarea.types';
export { Select } from './primitives/select/Select';
export { buildSelectViewModel, type BuildSelectViewModelInput } from './primitives/select/Select.adapter';
export { resolveSelect, type SelectResolverRuntime } from './primitives/select/Select.resolver';
export type { SelectOptionView, SelectViewProps } from './primitives/select/Select.types';
export { Checkbox } from './primitives/checkbox/Checkbox';
export { buildCheckboxViewModel, type BuildCheckboxViewModelInput } from './primitives/checkbox/Checkbox.adapter';
export { resolveCheckbox, type CheckboxResolverRuntime } from './primitives/checkbox/Checkbox.resolver';
export type { CheckboxViewProps } from './primitives/checkbox/Checkbox.types';
export { RadioGroup } from './primitives/radio-group/RadioGroup';
export {
  buildRadioGroupViewModel,
  type BuildRadioGroupViewModelInput,
} from './primitives/radio-group/RadioGroup.adapter';
export { resolveRadioGroup, type RadioGroupResolverRuntime } from './primitives/radio-group/RadioGroup.resolver';
export type {
  RadioGroupDirection,
  RadioGroupOptionView,
  RadioGroupViewProps,
} from './primitives/radio-group/RadioGroup.types';
export { Toggle } from './primitives/toggle/Toggle';
export { buildToggleViewModel, type BuildToggleViewModelInput } from './primitives/toggle/Toggle.adapter';
export { resolveToggle, type ToggleResolverRuntime } from './primitives/toggle/Toggle.resolver';
export type { ToggleViewProps } from './primitives/toggle/Toggle.types';
export { DateInput } from './primitives/date-input/DateInput';
export { buildDateInputViewModel, type BuildDateInputViewModelInput } from './primitives/date-input/DateInput.adapter';
export { resolveDateInput, type DateInputResolverRuntime } from './primitives/date-input/DateInput.resolver';
export type { DateInputViewProps } from './primitives/date-input/DateInput.types';

export { Badge } from './primitives/badge/Badge';
export { buildBadgeViewModel, type BuildBadgeViewModelInput } from './primitives/badge/Badge.adapter';
export { resolveBadge, type BadgeResolverRuntime } from './primitives/badge/Badge.resolver';
export type { BadgeVariant, BadgeViewProps } from './primitives/badge/Badge.types';
export { Separator } from './primitives/separator/Separator';
export { buildSeparatorViewModel, type BuildSeparatorViewModelInput } from './primitives/separator/Separator.adapter';
export { resolveSeparator, type SeparatorResolverRuntime } from './primitives/separator/Separator.resolver';
export type { SeparatorOrientation, SeparatorViewProps } from './primitives/separator/Separator.types';
export { Label } from './primitives/label/Label';
export { buildLabelViewModel, type BuildLabelViewModelInput } from './primitives/label/Label.adapter';
export { resolveLabel, type LabelResolverRuntime } from './primitives/label/Label.resolver';
export type { LabelViewProps } from './primitives/label/Label.types';
export { Button } from './primitives/button/Button';
export { buildButtonViewModel, type BuildButtonViewModelInput } from './primitives/button/Button.adapter';
export { resolveButton, type ButtonResolverRuntime } from './primitives/button/Button.resolver';
export type { ButtonVariant, ButtonSize, ButtonType, ButtonViewProps } from './primitives/button/Button.types';
export { Alert } from './primitives/alert/Alert';
export { buildAlertViewModel, type BuildAlertViewModelInput } from './primitives/alert/Alert.adapter';
export { resolveAlert, type AlertResolverRuntime } from './primitives/alert/Alert.resolver';
export type { AlertVariant, AlertViewProps } from './primitives/alert/Alert.types';
export { Progress } from './primitives/progress/Progress';
export { buildProgressViewModel, type BuildProgressViewModelInput } from './primitives/progress/Progress.adapter';
export { resolveProgress, type ProgressResolverRuntime } from './primitives/progress/Progress.resolver';
export type { ProgressViewProps } from './primitives/progress/Progress.types';
export { Skeleton } from './primitives/skeleton/Skeleton';
export { buildSkeletonViewModel, type BuildSkeletonViewModelInput } from './primitives/skeleton/Skeleton.adapter';
export { resolveSkeleton, type SkeletonResolverRuntime } from './primitives/skeleton/Skeleton.resolver';
export type { SkeletonViewProps } from './primitives/skeleton/Skeleton.types';
export { Avatar } from './primitives/avatar/Avatar';
export { buildAvatarViewModel, type BuildAvatarViewModelInput } from './primitives/avatar/Avatar.adapter';
export { resolveAvatar, type AvatarResolverRuntime } from './primitives/avatar/Avatar.resolver';
export type { AvatarSize, AvatarViewProps } from './primitives/avatar/Avatar.types';
export { Breadcrumb } from './primitives/breadcrumb/Breadcrumb';
export { buildBreadcrumbViewModel, type BuildBreadcrumbViewModelInput } from './primitives/breadcrumb/Breadcrumb.adapter';
export { resolveBreadcrumb, type BreadcrumbResolverRuntime } from './primitives/breadcrumb/Breadcrumb.resolver';
export type { BreadcrumbSeparator, BreadcrumbItemView, BreadcrumbViewProps } from './primitives/breadcrumb/Breadcrumb.types';
export { Card } from './primitives/card/Card';
export { buildCardViewModel, type BuildCardViewModelInput } from './primitives/card/Card.adapter';
export { resolveCard, type CardResolverRuntime } from './primitives/card/Card.resolver';
export type { CardViewProps } from './primitives/card/Card.types';

// New query contracts
export type { FilterOperator, FilterRule, FilterGroup } from './query/shared/filters';
export type { SortRule } from './query/shared/sort';
export type { ListParams, ListResult } from './query/shared/list';
export type { GetParams } from './query/shared/get';
export type { AggregateMetric, AggregateParams, AggregateResult } from './query/shared/aggregate';
export type { CreateResult, UpdateResult, DeleteResult } from './query/shared/mutation';
export type { EntityClient } from './query/shared/client';

// New hooks
export { useEntityList } from './query/hooks/useEntityList';
export { useEntityRecord } from './query/hooks/useEntityRecord';
export { useEntityAggregate } from './query/hooks/useEntityAggregate';
export { useCreateEntity } from './query/hooks/useCreateEntity';
export { useUpdateEntity } from './query/hooks/useUpdateEntity';
export { useDeleteEntity } from './query/hooks/useDeleteEntity';

// Cache
export { entityKeys } from './query/cache/queryKeys';

// Client
export { getEntityClient, fakeEntityClient, httpEntityClient } from './query/clients/index';

// Form field primitive (public types used by cell-primitive-data-runtime)
export { FormField } from './primitives/form-field/FormField';
export { buildFormFieldViewModel, type BuildFormFieldViewModelInput } from './primitives/form-field/FormField.adapter';
export type {
  FormFieldViewProps,
  FormFieldStandardViewProps,
  FormFieldCheckboxViewProps,
  FormFieldChoiceGroupViewProps,
  FormFieldOptionView,
  FormFieldMessageView,
  FormFieldMessageTone,
  FormFieldStandardControl,
} from './primitives/form-field/FormField.types';

// Relation field primitive
export { RelationField } from './primitives/relation-field/RelationField';
export {
  buildRelationFieldViewModel,
  type BuildRelationFieldViewModelInput,
} from './primitives/relation-field/RelationField.adapter';
export type {
  RelationFieldOption,
  RelationFieldViewProps,
  RelationFieldAttachViewProps,
  RelationFieldCreateViewProps,
  RelationFieldCreateOrAttachViewProps,
  RelationFieldRuntime,
} from './primitives/relation-field/RelationField.types';

// Form section
export {
  buildFormSectionViewModel,
  type BuildFormSectionViewModelInput,
  type FormSectionFieldRuntime,
} from './primitives/form-section/FormSection.adapter';
export type {
  FormSectionLayout,
  FormSectionStatus,
  FormSectionResolvedAction,
  FormSectionViewProps,
} from './primitives/form-section/FormSection.types';

// Form primitive
export { IkaryForm } from './primitives/form';
export {
  buildIkaryFormViewModel,
  buildFormViewModel,
  type BuildIkaryFormViewModelInput,
  type BuildFormViewModelInput,
} from './primitives/form';
export { buildEntityCreatePresentation } from './primitives/form';
export { useFormRuntime, type UseFormRuntimeOptions, type UseFormRuntimeResult } from './primitives/form';
export type { IkaryFormResolverRuntime } from './primitives/form';

// Chart primitives
export { AreaChart } from './primitives/area-chart/AreaChart';
export { buildAreaChartViewModel } from './primitives/area-chart/AreaChart.adapter';
export { resolveAreaChart } from './primitives/area-chart/AreaChart.resolver';
export type { AreaChartViewProps, AreaChartSeriesView } from './primitives/area-chart/AreaChart.types';

export { BarChart } from './primitives/bar-chart/BarChart';
export { buildBarChartViewModel } from './primitives/bar-chart/BarChart.adapter';
export { resolveBarChart } from './primitives/bar-chart/BarChart.resolver';
export type { BarChartViewProps, BarChartSeriesView } from './primitives/bar-chart/BarChart.types';

export { LineChart } from './primitives/line-chart/LineChart';
export { buildLineChartViewModel } from './primitives/line-chart/LineChart.adapter';
export { resolveLineChart } from './primitives/line-chart/LineChart.resolver';
export type { LineChartViewProps, LineChartSeriesView } from './primitives/line-chart/LineChart.types';

export { PieChart } from './primitives/pie-chart/PieChart';
export { buildPieChartViewModel } from './primitives/pie-chart/PieChart.adapter';
export { resolvePieChart } from './primitives/pie-chart/PieChart.resolver';
export type { PieChartViewProps, PieChartSliceView } from './primitives/pie-chart/PieChart.types';

export { RadarChart } from './primitives/radar-chart/RadarChart';
export { buildRadarChartViewModel } from './primitives/radar-chart/RadarChart.adapter';
export { resolveRadarChart } from './primitives/radar-chart/RadarChart.resolver';
export type { RadarChartViewProps, RadarChartSeriesView } from './primitives/radar-chart/RadarChart.types';

export { RadialChart } from './primitives/radial-chart/RadialChart';
export { buildRadialChartViewModel } from './primitives/radial-chart/RadialChart.adapter';
export { resolveRadialChart } from './primitives/radial-chart/RadialChart.resolver';
export type { RadialChartViewProps, RadialChartBarView } from './primitives/radial-chart/RadialChart.types';

// Shell components (CellAppShell, CellTopBar, CellRuntimeProvider) are provided
// by the enterprise @ikary/cell-shell package — not included in the open-source runtime.
