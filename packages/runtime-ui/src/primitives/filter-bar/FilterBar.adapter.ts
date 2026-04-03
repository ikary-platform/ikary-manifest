import type { FilterBarPresentation } from '@ikary-manifest/presentation';
import type {
  FilterBarActiveFilterView,
  FilterBarClearActionView,
  FilterBarFilterView,
  FilterBarOptionView,
  FilterBarViewProps,
} from './FilterBar.types';

const DEFAULT_VARIANT: FilterBarViewProps['variant'] = 'list';
const DEFAULT_DENSITY: FilterBarViewProps['density'] = 'comfortable';
const DEFAULT_ADVANCED_LABEL = 'Advanced filters';

export type BuildFilterBarViewModelInput = {
  presentation: FilterBarPresentation;
  actionHandlers?: Record<string, () => void>;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (key: string, value: unknown) => void;
  onSortChange?: (value: string) => void;
  onClear?: () => void;
  onRemoveActiveFilter?: (key: string) => void;
  onAdvancedToggle?: (open: boolean) => void;
};

export function buildFilterBarViewModel(input: BuildFilterBarViewModelInput): FilterBarViewProps {
  return {
    variant: input.presentation.variant ?? DEFAULT_VARIANT,
    density: input.presentation.density ?? DEFAULT_DENSITY,

    search: input.presentation.search
      ? {
          value: input.presentation.search.value,
          placeholder: normalizeOptionalText(input.presentation.search.placeholder),
          disabled: input.presentation.search.disabled ?? false,
        }
      : undefined,

    filters: input.presentation.filters?.map(
      (filter): FilterBarFilterView => ({
        key: filter.key,
        label: filter.label,
        type: filter.type,
        value: filter.value,
        placeholder: normalizeOptionalText(filter.placeholder),
        options: filter.options?.map(mapOption),
        disabled: filter.disabled ?? false,
      }),
    ),

    sort: input.presentation.sort
      ? {
          value: input.presentation.sort.value,
          placeholder: normalizeOptionalText(input.presentation.sort.placeholder),
          options: input.presentation.sort.options.map(mapOption),
          disabled: input.presentation.sort.disabled ?? false,
        }
      : undefined,

    activeFilters: input.presentation.activeFilters?.map(
      (filter): FilterBarActiveFilterView => ({
        key: filter.key,
        label: filter.label,
        valueLabel: filter.valueLabel,
      }),
    ),

    clearAction: resolveClearAction(input),

    advancedFilters: input.presentation.advancedFilters
      ? {
          enabled: input.presentation.advancedFilters.enabled ?? true,
          open: input.presentation.advancedFilters.open ?? false,
          label: normalizeOptionalText(input.presentation.advancedFilters.label) ?? DEFAULT_ADVANCED_LABEL,
        }
      : undefined,

    loading: input.presentation.loading ?? false,

    onSearchChange: input.onSearchChange,
    onFilterChange: input.onFilterChange,
    onSortChange: input.onSortChange,
    onRemoveActiveFilter: input.onRemoveActiveFilter,
    onAdvancedToggle: input.onAdvancedToggle,
  };
}

function resolveClearAction(input: BuildFilterBarViewModelInput): FilterBarClearActionView | undefined {
  const clearAction = input.presentation.clearAction;
  if (!clearAction) return undefined;

  const actionHandler = clearAction.actionKey ? input.actionHandlers?.[clearAction.actionKey] : undefined;

  const onClick = input.onClear ?? actionHandler;

  return {
    label: clearAction.label.trim(),
    onClick,
    disabled: typeof onClick !== 'function',
  };
}

function mapOption(option: { value: string; label: string }): FilterBarOptionView {
  return {
    value: option.value,
    label: option.label,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
