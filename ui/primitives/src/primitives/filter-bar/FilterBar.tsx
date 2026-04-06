import { useId } from 'react';
import { Checkbox } from '../checkbox';
import { DateInput } from '../date-input';
import { Input } from '../input';
import { Select } from '../select';
import { Toggle } from '../toggle';
import type { FilterBarActiveFilterView, FilterBarFilterView, FilterBarViewProps } from './FilterBar.types';

export function FilterBar({
  variant = 'list',
  density = 'comfortable',
  search,
  filters = [],
  sort,
  activeFilters = [],
  clearAction,
  advancedFilters,
  loading = false,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onRemoveActiveFilter,
  onAdvancedToggle,
}: FilterBarViewProps) {
  const instanceId = useId();

  const { primaryFilters, advancedRegionFilters } = splitFiltersForLayout({
    filters,
    advancedFilters,
  });

  const hasQueryRow =
    Boolean(search) || primaryFilters.length > 0 || Boolean(sort) || Boolean(advancedFilters?.enabled) || loading;

  const hasSummaryRow = activeFilters.length > 0 || Boolean(clearAction);

  const hasAdvancedRegion =
    Boolean(advancedFilters?.enabled) && Boolean(advancedFilters?.open) && advancedRegionFilters.length > 0;

  if (!hasQueryRow && !hasSummaryRow && !hasAdvancedRegion) {
    return null;
  }

  return (
    <section
      data-filter-bar-variant={variant}
      className={['rounded-lg border', variantClassName(variant), density === 'compact' ? 'p-3' : 'p-4'].join(' ')}
    >
      <div className="space-y-3">
        {hasQueryRow ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                {search ? (
                  <div className="min-w-0 flex-1 sm:max-w-sm">
                    <label
                      htmlFor={`${instanceId}-search`}
                      className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Search
                    </label>
                    <Input
                      id={`${instanceId}-search`}
                      inputType="search"
                      value={search.value}
                      placeholder={search.placeholder ?? 'Search'}
                      disabled={loading || search.disabled}
                      loading={loading}
                      onValueChange={onSearchChange}
                    />
                  </div>
                ) : null}

                {primaryFilters.map((filter) => (
                  <FilterControl
                    key={filter.key}
                    filter={filter}
                    idPrefix={instanceId}
                    density={density}
                    loading={loading}
                    onFilterChange={onFilterChange}
                  />
                ))}

                {sort ? (
                  <div className="min-w-48 flex-1 sm:max-w-xs">
                    <label
                      htmlFor={`${instanceId}-sort`}
                      className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Sort
                    </label>
                    <Select
                      id={`${instanceId}-sort`}
                      value={sort.value}
                      placeholder={sort.placeholder ?? 'Sort'}
                      options={sort.options}
                      disabled={loading || sort.disabled}
                      loading={loading}
                      onValueChange={onSortChange}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {advancedFilters?.enabled ? (
                <button
                  type="button"
                  disabled={loading || typeof onAdvancedToggle !== 'function'}
                  aria-expanded={advancedFilters.open ? 'true' : 'false'}
                  onClick={() => onAdvancedToggle?.(!advancedFilters.open)}
                  className={[
                    'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    advancedFilters.open
                      ? 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900',
                  ].join(' ')}
                >
                  {advancedFilters.label}
                </button>
              ) : null}

              {loading ? (
                <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <InlineSpinner />
                  {density === 'compact' ? 'Updating' : 'Updating results'}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {hasSummaryRow ? (
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            {activeFilters.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((activeFilter) => (
                  <ActiveFilterPill
                    key={activeFilter.key}
                    activeFilter={activeFilter}
                    loading={loading}
                    onRemoveActiveFilter={onRemoveActiveFilter}
                  />
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">No active filters</span>
            )}

            {clearAction ? (
              <button
                type="button"
                disabled={loading || clearAction.disabled}
                onClick={clearAction.onClick}
                className={[
                  'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                  'dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900',
                ].join(' ')}
              >
                {clearAction.label}
              </button>
            ) : null}
          </div>
        ) : null}

        {hasAdvancedRegion ? (
          <div className="rounded-md border border-dashed border-gray-200 p-3 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {advancedRegionFilters.map((filter) => (
                <FilterControl
                  key={filter.key}
                  filter={filter}
                  idPrefix={instanceId}
                  density={density}
                  loading={loading}
                  onFilterChange={onFilterChange}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FilterControl({
  filter,
  idPrefix,
  density,
  loading,
  onFilterChange,
}: {
  filter: FilterBarFilterView;
  idPrefix: string;
  density: FilterBarViewProps['density'];
  loading: boolean;
  onFilterChange?: (key: string, value: unknown) => void;
}) {
  const controlId = `${idPrefix}-${filter.key}`;
  const disabled = loading || filter.disabled;
  const labelClassName =
    density === 'compact'
      ? 'mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400'
      : 'mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400';

  if (filter.type === 'checkbox') {
    return (
      <div className="min-w-40 flex-1 sm:max-w-xs">
        <label htmlFor={controlId} className={labelClassName}>
          {filter.label}
        </label>
        <Checkbox
          id={controlId}
          checked={Boolean(filter.value)}
          disabled={disabled}
          loading={loading}
          onCheckedChange={(checked) => onFilterChange?.(filter.key, checked)}
        />
      </div>
    );
  }

  if (filter.type === 'toggle') {
    return (
      <div className="min-w-40 flex-1 sm:max-w-xs">
        <label htmlFor={controlId} className={labelClassName}>
          {filter.label}
        </label>
        <div className="flex items-center">
          <Toggle
            id={controlId}
            checked={Boolean(filter.value)}
            disabled={disabled}
            loading={loading}
            onCheckedChange={(checked) => onFilterChange?.(filter.key, checked)}
          />
        </div>
      </div>
    );
  }

  if (filter.type === 'date') {
    return (
      <div className="min-w-44 flex-1 sm:max-w-xs">
        <label htmlFor={controlId} className={labelClassName}>
          {filter.label}
        </label>
        <DateInput
          id={controlId}
          value={toOptionalString(filter.value)}
          placeholder={filter.placeholder}
          disabled={disabled}
          loading={loading}
          onValueChange={(value) => onFilterChange?.(filter.key, value)}
        />
      </div>
    );
  }

  if (filter.type === 'date-range') {
    const range = toDateRangeValue(filter.value);

    return (
      <div className="min-w-56 flex-1">
        <span className={labelClassName}>{filter.label}</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <DateInput
            id={`${controlId}-from`}
            value={range.from}
            placeholder={filter.placeholder ?? 'From'}
            disabled={disabled}
            loading={loading}
            onValueChange={(from) =>
              onFilterChange?.(filter.key, {
                from,
                to: range.to,
              })
            }
          />
          <DateInput
            id={`${controlId}-to`}
            value={range.to}
            placeholder="To"
            disabled={disabled}
            loading={loading}
            onValueChange={(to) =>
              onFilterChange?.(filter.key, {
                from: range.from,
                to,
              })
            }
          />
        </div>
      </div>
    );
  }

  if (filter.type === 'select') {
    return (
      <div className="min-w-44 flex-1 sm:max-w-xs">
        <label htmlFor={controlId} className={labelClassName}>
          {filter.label}
        </label>
        <Select
          id={controlId}
          value={toOptionalString(filter.value)}
          placeholder={filter.placeholder}
          options={filter.options ?? []}
          disabled={disabled}
          loading={loading}
          onValueChange={(value) => onFilterChange?.(filter.key, value)}
        />
      </div>
    );
  }

  if (filter.type === 'multi-select') {
    const value = toStringArray(filter.value);

    return (
      <div className="min-w-44 flex-1 sm:max-w-xs">
        <label htmlFor={controlId} className={labelClassName}>
          {filter.label}
        </label>
        <select
          id={controlId}
          multiple
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const next = Array.from(event.currentTarget.selectedOptions).map((option) => option.value);
            onFilterChange?.(filter.key, next);
          }}
          className={[
            'min-h-16 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200',
          ].join(' ')}
        >
          {(filter.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const inputType = filter.type === 'number' ? 'number' : 'text';

  return (
    <div className="min-w-44 flex-1 sm:max-w-xs">
      <label htmlFor={controlId} className={labelClassName}>
        {filter.label}
      </label>
      <Input
        id={controlId}
        inputType={inputType}
        value={toOptionalString(filter.value)}
        placeholder={filter.placeholder}
        disabled={disabled}
        loading={loading}
        onValueChange={(value) => onFilterChange?.(filter.key, value)}
      />
    </div>
  );
}

function ActiveFilterPill({
  activeFilter,
  loading,
  onRemoveActiveFilter,
}: {
  activeFilter: FilterBarActiveFilterView;
  loading: boolean;
  onRemoveActiveFilter?: (key: string) => void;
}) {
  if (typeof onRemoveActiveFilter !== 'function') {
    return (
      <span
        className={[
          'inline-flex items-center rounded-full border px-2.5 py-1 text-xs',
          'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300',
        ].join(' ')}
      >
        {activeFilter.label}: {activeFilter.valueLabel}
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => onRemoveActiveFilter(activeFilter.key)}
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800',
      ].join(' ')}
    >
      <span>
        {activeFilter.label}: {activeFilter.valueLabel}
      </span>
      <span aria-hidden="true">×</span>
      <span className="sr-only">Remove {activeFilter.label} filter</span>
    </button>
  );
}

function splitFiltersForLayout(args: {
  filters: FilterBarFilterView[];
  advancedFilters: FilterBarViewProps['advancedFilters'];
}): {
  primaryFilters: FilterBarFilterView[];
  advancedRegionFilters: FilterBarFilterView[];
} {
  if (!args.advancedFilters?.enabled) {
    return {
      primaryFilters: args.filters,
      advancedRegionFilters: [],
    };
  }

  if (args.filters.length <= 2) {
    return {
      primaryFilters: args.filters,
      advancedRegionFilters: [],
    };
  }

  return {
    primaryFilters: args.filters.slice(0, 2),
    advancedRegionFilters: args.filters.slice(2),
  };
}

function variantClassName(variant: FilterBarViewProps['variant']): string {
  switch (variant) {
    case 'section':
      return 'border-gray-200 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-900/40';
    case 'widget':
      return 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950';
    case 'list':
    default:
      return 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950';
  }
}

function toOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return String(value);
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry) => entry !== undefined && entry !== null).map((entry) => String(entry));
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return [String(value)];
}

function toDateRangeValue(value: unknown): { from?: string; to?: string } {
  if (Array.isArray(value)) {
    return {
      from: toOptionalString(value[0]),
      to: toOptionalString(value[1]),
    };
  }

  if (value && typeof value === 'object') {
    const asObject = value as { from?: unknown; to?: unknown };
    return {
      from: toOptionalString(asObject.from),
      to: toOptionalString(asObject.to),
    };
  }

  return {};
}

function InlineSpinner() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300"
    />
  );
}
