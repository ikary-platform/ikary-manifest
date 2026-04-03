import type { ActionDefinition } from '../../types/ActionTypes';
import type { FilterGroup, FilterRule } from '../../query/shared/filters';

export const SEARCH_DEBOUNCE_MS = 300;

type SortDirection = 'asc' | 'desc';
type ListPageView = 'grid' | 'cards';
type ListPageRenderer = 'grid' | 'cards' | 'switchable';

export type ListPageRouteState = {
  q: string;
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: SortDirection;
  view: ListPageView;
  filters: Record<string, string>;
};

export type ParseRouteStateOptions = {
  renderer: ListPageRenderer;
  defaultView: ListPageView;
  defaultPageSize: number;
  pageSizeOptions: number[];
  allowedSortFields?: Set<string>;
  allowedFilterKeys?: Set<string>;
};

export type EntityFieldLike = {
  key: string;
  name?: string;
  type?: string;
  options?: Array<{ label: string; value: string }>;
};

export type FilterDefinition = {
  key: string;
  label?: string;
  field?: string;
  type?: 'text' | 'select' | 'boolean';
  options?: Array<{ label: string; value: string }>;
};

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.location !== 'undefined';
}

export function parseRouteState(search: string, options: ParseRouteStateOptions): ListPageRouteState {
  const params = new URLSearchParams(search);

  const q = (params.get('q') ?? '').trim();
  const page = parsePositiveInt(params.get('page'), 1);
  let pageSize = parsePositiveInt(params.get('pageSize'), options.defaultPageSize);

  if (options.pageSizeOptions.length > 0 && !options.pageSizeOptions.includes(pageSize)) {
    pageSize = options.defaultPageSize;
  }

  let sortField = (params.get('sortField') ?? '').trim() || undefined;
  const rawSortDirection = (params.get('sortDirection') ?? '').trim();
  let sortDirection: SortDirection | undefined =
    rawSortDirection === 'asc' || rawSortDirection === 'desc' ? rawSortDirection : undefined;

  if (options.allowedSortFields && sortField && !options.allowedSortFields.has(sortField)) {
    sortField = undefined;
    sortDirection = undefined;
  }

  let view: ListPageView = params.get('view') === 'cards' ? 'cards' : 'grid';

  if (options.renderer !== 'switchable') {
    view = options.renderer === 'cards' ? 'cards' : 'grid';
  } else if (view !== 'grid' && view !== 'cards') {
    view = options.defaultView;
  }

  const filters = normalizeFilters(parseFiltersFromSearch(params), options.allowedFilterKeys);

  return {
    q,
    page,
    pageSize,
    sortField,
    sortDirection,
    view,
    filters,
  };
}

export function writeRouteState(state: ListPageRouteState): void {
  if (!isBrowser()) return;

  const params = new URLSearchParams();

  if (state.q) params.set('q', state.q);
  if (state.page > 1) params.set('page', String(state.page));
  if (state.pageSize > 0) params.set('pageSize', String(state.pageSize));
  if (state.sortField) params.set('sortField', state.sortField);
  if (state.sortDirection) params.set('sortDirection', state.sortDirection);
  if (state.view) params.set('view', state.view);

  for (const [key, value] of Object.entries(state.filters)) {
    if (value) {
      params.set(`filter.${key}`, value);
    }
  }

  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;

  window.history.replaceState(null, '', nextUrl);
}

export function normalizeFilters(
  filters: Record<string, string>,
  allowedFilterKeys?: Set<string>,
): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(filters)) {
    const trimmedKey = key.trim();
    const trimmedValue = value.trim();

    if (!trimmedKey || !trimmedValue) continue;
    if (allowedFilterKeys && !allowedFilterKeys.has(trimmedKey)) continue;

    normalized[trimmedKey] = trimmedValue;
  }

  return normalized;
}

export function buildFilterGroup(
  filters: Record<string, string>,
  filterDefinitionMap: Record<string, FilterDefinition>,
  searchQuery: string,
  searchableFields: string[],
): FilterGroup | undefined {
  const andClauses: Array<FilterRule | FilterGroup> = [];

  const normalizedSearch = searchQuery.trim();
  if (normalizedSearch && searchableFields.length > 0) {
    andClauses.push({
      logic: 'or',
      filters: searchableFields.map((field) => ({
        field,
        op: 'contains',
        value: normalizedSearch,
      })),
    });
  }

  for (const [key, value] of Object.entries(filters)) {
    const definition = filterDefinitionMap[key];
    if (!definition) continue;

    const field = definition.field ?? definition.key;
    if (!field) continue;

    if (definition.type === 'boolean') {
      andClauses.push({
        field,
        op: 'eq',
        value: value === 'true',
      });
      continue;
    }

    andClauses.push({
      field,
      op: 'eq',
      value,
    });
  }

  if (andClauses.length === 0) {
    return undefined;
  }

  return {
    logic: 'and',
    filters: andClauses,
  };
}

export function deriveDefaultSearchableFields(
  listEntity: string,
  contextEntityKey: string,
  contextFields: EntityFieldLike[],
): string[] {
  if (listEntity !== contextEntityKey) {
    return ['name'];
  }

  const preferred = contextFields
    .filter((field) => ['string', 'text', 'email'].includes((field.type ?? '').toLowerCase()))
    .map((field) => field.key);

  if (preferred.length > 0) {
    return preferred.slice(0, 5);
  }

  return contextFields.slice(0, 5).map((field) => field.key);
}

export function deriveDefaultFilters(
  listEntity: string,
  contextEntityKey: string,
  contextFields: EntityFieldLike[],
): FilterDefinition[] {
  if (listEntity !== contextEntityKey) {
    return [];
  }

  return contextFields
    .filter((field) => {
      const type = (field.type ?? '').toLowerCase();
      return type === 'boolean' || type === 'enum' || type === 'status';
    })
    .map((field) => ({
      key: field.key,
      label: field.name ?? field.key,
      field: field.key,
      type: field.type?.toLowerCase() === 'boolean' ? 'boolean' : 'select',
      options: field.options,
    }));
}

export function interpolateParams(
  params: Record<string, unknown> | undefined,
  row: Record<string, unknown>,
  extra: Record<string, unknown> = {},
): Record<string, unknown> | undefined {
  if (!params) return undefined;

  const scope = {
    ...row,
    ...extra,
  };

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    result[key] = interpolateValue(value, scope);
  }

  return result;
}

function interpolateValue(value: unknown, scope: Record<string, unknown>): unknown {
  if (typeof value === 'string') {
    return value.replace(/\{\{([^}]+)\}\}/g, (_, token: string) => {
      const resolved = getByPath(scope, token.trim());
      return resolved == null ? '' : String(resolved);
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateValue(item, scope));
  }

  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      next[key] = interpolateValue(nestedValue, scope);
    }
    return next;
  }

  return value;
}

function getByPath(input: Record<string, unknown>, path: string): unknown {
  if (!path) return undefined;

  const segments = path.split('.');
  let current: unknown = input;

  for (const segment of segments) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function parseFiltersFromSearch(params: URLSearchParams): Record<string, string> {
  const filters: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    if (!key.startsWith('filter.')) continue;

    const filterKey = key.slice('filter.'.length).trim();
    if (!filterKey) continue;

    filters[filterKey] = value;
  }

  return filters;
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;

  return Math.trunc(parsed);
}
