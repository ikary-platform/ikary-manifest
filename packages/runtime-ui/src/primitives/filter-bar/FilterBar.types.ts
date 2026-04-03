export type FilterBarVariant = 'list' | 'section' | 'widget';

export type FilterBarDensity = 'comfortable' | 'compact';

export type FilterBarControlType =
  | 'text'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'toggle'
  | 'date'
  | 'date-range'
  | 'number';

export type FilterBarOptionView = {
  value: string;
  label: string;
};

export type FilterBarFilterView = {
  key: string;
  label: string;
  type: FilterBarControlType;
  value?: unknown;
  placeholder?: string;
  options?: FilterBarOptionView[];
  disabled?: boolean;
};

export type FilterBarSearchView = {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
};

export type FilterBarSortView = {
  value?: string;
  placeholder?: string;
  options: FilterBarOptionView[];
  disabled?: boolean;
};

export type FilterBarActiveFilterView = {
  key: string;
  label: string;
  valueLabel: string;
};

export type FilterBarClearActionView = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type FilterBarAdvancedFiltersView = {
  enabled: boolean;
  open: boolean;
  label: string;
};

export type FilterBarViewProps = {
  variant: FilterBarVariant;
  density: FilterBarDensity;

  search?: FilterBarSearchView;
  filters?: FilterBarFilterView[];
  sort?: FilterBarSortView;
  activeFilters?: FilterBarActiveFilterView[];

  clearAction?: FilterBarClearActionView;
  advancedFilters?: FilterBarAdvancedFiltersView;

  loading: boolean;

  onSearchChange?: (value: string) => void;
  onFilterChange?: (key: string, value: unknown) => void;
  onSortChange?: (value: string) => void;
  onRemoveActiveFilter?: (key: string) => void;
  onAdvancedToggle?: (open: boolean) => void;
};
