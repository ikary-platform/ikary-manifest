import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrimitiveRenderer, listPrimitives } from '@ikary/cell-runtime-ui';
import '@ikary/cell-runtime-ui/registry';
import { PRIMITIVE_DEMOS, DEFAULT_DEMO } from './primitive-demos';
import { getRuntimePathForPrimitive, toTabPath } from '../features/launchpad/launchpad-routes';
import { isDemoPrimitiveVisible } from '../features/launchpad/demo-hidden-primitives';

const PRIMITIVE_DOCUMENTATION_MD_LOADERS = import.meta.glob(
  [
    '../../../../libs/cell-contract-presentation/src/contract/**/*.md',
    '!../../../../libs/cell-contract-presentation/src/contract/**/*.LLD.md',
    '!../../../../libs/cell-contract-presentation/src/contract/**/*.llm.md',
  ],
  {
    query: '?raw',
    import: 'default',
  },
) as Record<string, () => Promise<string>>;

interface ParseState<T> {
  text: string;
  live: T;
  error: string | null;
}

function useJsonState<T>(initial: T): [ParseState<T>, (value: string) => void] {
  const [state, setState] = useState<ParseState<T>>({
    text: JSON.stringify(initial, null, 2),
    live: initial,
    error: null,
  });

  function handleChange(value: string) {
    try {
      const parsed = JSON.parse(value);
      setState({ text: value, live: parsed as T, error: null });
    } catch (error) {
      setState((current) => ({
        ...current,
        text: value,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      }));
    }
  }

  return [state, handleChange];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function toPositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(value));
}

function normalizeSort(value: unknown): { field?: string; direction?: 'asc' | 'desc' } | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    field: typeof value.field === 'string' ? value.field : undefined,
    direction: value.direction === 'asc' || value.direction === 'desc' ? value.direction : undefined,
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
}

function toBooleanRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'),
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter((token) => token.length > 0)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join('');
}

function findDocumentationLoaderByName(name: string): (() => Promise<string>) | null {
  const fileName = `/${name}.md`;
  const entries = Object.entries(PRIMITIVE_DOCUMENTATION_MD_LOADERS).filter(([path]) => path.endsWith(fileName));

  if (entries.length === 0) {
    return null;
  }

  entries.sort(([aPath], [bPath]) => aPath.length - bPath.length);
  return entries[0][1];
}

function resolvePrimitiveDocumentationLoader(primitive: string, contractType: string): (() => Promise<string>) | null {
  const candidates = new Set<string>([toPascalCase(contractType), toPascalCase(primitive)]);

  for (const candidate of candidates) {
    const loader = findDocumentationLoaderByName(candidate);
    if (loader) {
      return loader;
    }
  }

  return null;
}

function buildDataGridRuntime(input: Record<string, unknown>) {
  const rows = Array.isArray(input.rows) ? input.rows : [];
  const selectedRowIds = Array.isArray(input.selectedRowIds)
    ? input.selectedRowIds.filter((id): id is string => typeof id === 'string')
    : [];

  return {
    rows,
    loading: Boolean(input.loading),
    selectedRowIds,
    sort: normalizeSort(input.sort),
    getRowId: (row: unknown, index: number) => {
      if (isRecord(row) && (typeof row.id === 'string' || typeof row.id === 'number')) {
        return String(row.id);
      }

      return `row-${index + 1}`;
    },
    onSelectionChange: (ids: string[]) => {
      console.info('[playground] data-grid selection changed', ids);
    },
    onSortChange: (field: string, direction: 'asc' | 'desc') => {
      console.info('[playground] data-grid sort changed', { field, direction });
    },
    onRowOpen: (row: unknown) => {
      console.info('[playground] data-grid row open', row);
    },
    actionHandlers: {
      open: (row: unknown) => {
        console.info('[playground] data-grid action open', row);
      },
      edit: (row: unknown) => {
        console.info('[playground] data-grid action edit', row);
      },
      delete: (row: unknown) => {
        console.info('[playground] data-grid action delete', row);
      },
    },
  };
}

function buildPaginationRuntime(input: Record<string, unknown>) {
  const page = toPositiveInt(input.page, 2);
  const pageSize = toPositiveInt(input.pageSize, 25);

  const parsedTotalItems = typeof input.totalItems === 'number' ? input.totalItems : Number(input.totalItems ?? 132);

  const totalItems = Number.isFinite(parsedTotalItems) ? Math.max(0, Math.trunc(parsedTotalItems)) : 132;

  const totalPages = Math.max(
    1,
    toPositiveInt(input.totalPages, Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)))),
  );

  return {
    page: Math.min(page, totalPages),
    pageSize,
    totalItems,
    totalPages,
    onPageChange: (nextPage: number) => {
      console.info('[playground] pagination page changed', nextPage);
    },
    onPageSizeChange: (nextPageSize: number) => {
      console.info('[playground] pagination page size changed', nextPageSize);
    },
  };
}

function buildFormFieldRuntime(input: Record<string, unknown>) {
  return {
    value: input.value,
    onValueChange: (nextValue: unknown) => {
      console.info('[playground] form-field value changed', nextValue);
    },
    onBlur: () => {
      console.info('[playground] form-field blur');
    },
  };
}

function buildInputRuntime(input: Record<string, unknown>) {
  return {
    value: typeof input.value === 'string' || typeof input.value === 'number' ? input.value : undefined,
    onValueChange: (value: string) => {
      console.info('[playground] input value changed', value);
    },
    onBlur: () => {
      console.info('[playground] input blur');
    },
  };
}

function buildTextareaRuntime(input: Record<string, unknown>) {
  return {
    value: typeof input.value === 'string' ? input.value : undefined,
    onValueChange: (value: string) => {
      console.info('[playground] textarea value changed', value);
    },
    onBlur: () => {
      console.info('[playground] textarea blur');
    },
  };
}

function buildSelectRuntime(input: Record<string, unknown>) {
  return {
    value: typeof input.value === 'string' ? input.value : undefined,
    onValueChange: (value: string) => {
      console.info('[playground] select value changed', value);
    },
    onBlur: () => {
      console.info('[playground] select blur');
    },
  };
}

function buildCheckboxRuntime(input: Record<string, unknown>) {
  return {
    checked: typeof input.checked === 'boolean' ? input.checked : undefined,
    onCheckedChange: (checked: boolean) => {
      console.info('[playground] checkbox changed', checked);
    },
    onBlur: () => {
      console.info('[playground] checkbox blur');
    },
  };
}

function buildRadioGroupRuntime(input: Record<string, unknown>) {
  return {
    value: typeof input.value === 'string' ? input.value : undefined,
    onValueChange: (value: string) => {
      console.info('[playground] radio-group value changed', value);
    },
    onBlur: () => {
      console.info('[playground] radio-group blur');
    },
  };
}

function buildToggleRuntime(input: Record<string, unknown>) {
  return {
    checked: typeof input.checked === 'boolean' ? input.checked : undefined,
    onCheckedChange: (checked: boolean) => {
      console.info('[playground] toggle changed', checked);
    },
    onBlur: () => {
      console.info('[playground] toggle blur');
    },
  };
}

function buildDateInputRuntime(input: Record<string, unknown>) {
  return {
    value: typeof input.value === 'string' ? input.value : undefined,
    onValueChange: (value: string) => {
      console.info('[playground] date-input value changed', value);
    },
    onBlur: () => {
      console.info('[playground] date-input blur');
    },
  };
}

function extractFormSectionActionKeys(props: Record<string, unknown>): string[] {
  if (!Array.isArray(props.actions)) {
    return [];
  }

  const keys = new Set<string>();

  for (const action of props.actions) {
    if (!isRecord(action) || typeof action.actionKey !== 'string') {
      continue;
    }

    keys.add(action.actionKey);
  }

  return Array.from(keys);
}

function extractFormSectionFieldKeys(props: Record<string, unknown>): string[] {
  if (!Array.isArray(props.fields)) {
    return [];
  }

  const keys = new Set<string>();

  for (const field of props.fields) {
    if (!isRecord(field) || typeof field.key !== 'string') {
      continue;
    }

    keys.add(field.key);
  }

  return Array.from(keys);
}

function extractFormActionKeys(props: Record<string, unknown>): string[] {
  if (!Array.isArray(props.sections)) {
    return [];
  }

  const keys = new Set<string>();

  for (const section of props.sections) {
    if (!isRecord(section) || !Array.isArray(section.actions)) {
      continue;
    }

    for (const action of section.actions) {
      if (!isRecord(action) || typeof action.actionKey !== 'string') {
        continue;
      }

      keys.add(action.actionKey);
    }
  }

  return Array.from(keys);
}

function buildFormSectionRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const fieldValues = isRecord(runtime.fieldValues) ? runtime.fieldValues : {};
  const actionHandlers = Object.fromEntries(
    extractFormSectionActionKeys(props).map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] form-section action', actionKey);
      },
    ]),
  );

  const fieldRuntime = Object.fromEntries(
    extractFormSectionFieldKeys(props).map((fieldKey) => [
      fieldKey,
      {
        value: fieldValues[fieldKey],
        onValueChange: (nextValue: unknown) => {
          console.info('[playground] form-section field value changed', {
            fieldKey,
            nextValue,
          });
        },
        onBlur: () => {
          console.info('[playground] form-section field blur', fieldKey);
        },
      },
    ]),
  );

  const authorizedActionKeys = new Set(toStringArray(runtime.authorizedActionKeys));
  const hasExplicitAuthorization = authorizedActionKeys.size > 0;

  return {
    fieldRuntime,
    actionHandlers,
    isAuthorized: hasExplicitAuthorization ? (actionKey: string) => authorizedActionKeys.has(actionKey) : undefined,
    expanded: typeof runtime.expanded === 'boolean' ? runtime.expanded : undefined,
    onExpandedChange: (expanded: boolean) => {
      console.info('[playground] form-section expanded changed', expanded);
    },
  };
}

function buildFormRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const initialValues = isRecord(runtime.initialValues) ? runtime.initialValues : {};

  const draftValues = isRecord(runtime.draftValues) ? runtime.draftValues : undefined;

  const sectionActionHandlers = Object.fromEntries(
    extractFormActionKeys(props).map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] form section action', actionKey);
      },
    ]),
  );

  const authorizedActionKeys = new Set(toStringArray(runtime.authorizedActionKeys));
  const hasExplicitAuthorization = authorizedActionKeys.size > 0;

  const commitFieldErrors = toStringRecord(runtime.commitFieldErrors);
  const hasCommitFieldErrors = Object.keys(commitFieldErrors).length > 0;
  const failSaveDraft = runtime.failSaveDraft === true;
  const failCommit = runtime.failCommit === true;
  const conflictOnCommit = runtime.conflictOnCommit === true;
  const saveDraftDelayMs = toPositiveInt(runtime.saveDraftDelayMs, 350);
  const commitDelayMs = toPositiveInt(runtime.commitDelayMs, 550);

  const permissions = isRecord(runtime.permissions)
    ? {
        canEdit: typeof runtime.permissions.canEdit === 'boolean' ? runtime.permissions.canEdit : undefined,
        canSaveDraft:
          typeof runtime.permissions.canSaveDraft === 'boolean' ? runtime.permissions.canSaveDraft : undefined,
        canCommit: typeof runtime.permissions.canCommit === 'boolean' ? runtime.permissions.canCommit : undefined,
        canDiscard: typeof runtime.permissions.canDiscard === 'boolean' ? runtime.permissions.canDiscard : undefined,
        canResolveConflict:
          typeof runtime.permissions.canResolveConflict === 'boolean'
            ? runtime.permissions.canResolveConflict
            : undefined,
      }
    : undefined;

  const conflictState =
    typeof runtime.conflict === 'string'
      ? { message: runtime.conflict }
      : isRecord(runtime.conflict) && typeof runtime.conflict.message === 'string'
        ? { message: runtime.conflict.message }
        : undefined;

  return {
    initialValues,
    draftValues,
    loading: Boolean(runtime.loading),
    fieldErrors: toStringRecord(runtime.fieldErrors),
    formError: typeof runtime.formError === 'string' ? runtime.formError : undefined,
    locked: runtime.locked === true,
    lockReason: typeof runtime.lockReason === 'string' ? runtime.lockReason : undefined,
    conflict: conflictState,
    permissions,
    expandedSections: toBooleanRecord(runtime.expandedSections),
    lastSavedAt: typeof runtime.lastSavedAt === 'string' ? runtime.lastSavedAt : undefined,
    sectionActionHandlers,
    isAuthorized: hasExplicitAuthorization ? (actionKey: string) => authorizedActionKeys.has(actionKey) : undefined,
    onValuesChange: (values: Record<string, unknown>) => {
      console.info('[playground] form values changed', values);
    },
    onStatusChange: (status: string) => {
      console.info('[playground] form status changed', status);
    },
    onSaveDraft: async ({
      values,
      reason,
    }: {
      values: Record<string, unknown>;
      reason: 'manual' | 'autosave' | 'blur';
    }) => {
      await wait(saveDraftDelayMs);
      console.info('[playground] form save draft', { values, reason });

      if (failSaveDraft) {
        throw {
          formError:
            typeof runtime.saveDraftError === 'string' ? runtime.saveDraftError : 'Draft save failed in demo mode',
        };
      }
    },
    onCommit: async ({ values }: { values: Record<string, unknown> }) => {
      await wait(commitDelayMs);
      console.info('[playground] form commit', values);

      if (conflictOnCommit) {
        throw {
          conflict: {
            message:
              typeof runtime.commitConflictMessage === 'string'
                ? runtime.commitConflictMessage
                : 'A newer revision exists. Reload before committing.',
          },
        };
      }

      if (hasCommitFieldErrors) {
        throw {
          fieldErrors: commitFieldErrors,
          formError:
            typeof runtime.commitValidationError === 'string'
              ? runtime.commitValidationError
              : 'Please resolve validation errors before committing.',
        };
      }

      if (failCommit) {
        throw {
          formError: typeof runtime.commitError === 'string' ? runtime.commitError : 'Commit failed in demo mode',
        };
      }
    },
    onDiscard: async ({ mode }: { mode: 'draft-only' | 'draft-and-commit' | 'commit-only' }) => {
      console.info('[playground] form discard', mode);

      if (mode === 'commit-only') {
        return { values: initialValues };
      }

      return { values: draftValues ?? initialValues };
    },
    onResolveConflict: async ({
      values,
      conflict,
    }: {
      values: Record<string, unknown>;
      conflict: { message: string };
    }) => {
      console.info('[playground] form resolve conflict', { values, conflict });
      await wait(200);

      const resolvedValues = isRecord(runtime.resolveConflictValues) ? runtime.resolveConflictValues : values;

      return { values: resolvedValues };
    },
    onRetry: async () => {
      console.info('[playground] form retry');
    },
  };
}

function extractPageHeaderActionKeys(props: Record<string, unknown>): string[] {
  const actionKeys = new Set<string>();

  if (isRecord(props.primaryAction) && typeof props.primaryAction.actionKey === 'string') {
    actionKeys.add(props.primaryAction.actionKey);
  }

  if (Array.isArray(props.secondaryActions)) {
    for (const action of props.secondaryActions) {
      if (!isRecord(action) || typeof action.actionKey !== 'string') {
        continue;
      }
      actionKeys.add(action.actionKey);
    }
  }

  return Array.from(actionKeys);
}

function extractDetailSectionActionKeys(props: Record<string, unknown>): string[] {
  if (!Array.isArray(props.actions)) {
    return [];
  }

  const keys = new Set<string>();

  for (const action of props.actions) {
    if (!isRecord(action) || typeof action.actionKey !== 'string') {
      continue;
    }

    keys.add(action.actionKey);
  }

  return Array.from(keys);
}

function extractDetailPageActionKeys(props: Record<string, unknown>): string[] {
  if (!Array.isArray(props.actions)) {
    return [];
  }

  const keys = new Set<string>();

  for (const action of props.actions) {
    if (!isRecord(action) || typeof action.actionKey !== 'string') {
      continue;
    }

    keys.add(action.actionKey);
  }

  return Array.from(keys);
}

function extractMetricCardActionKeys(props: Record<string, unknown>): string[] {
  if (!isRecord(props.action) || typeof props.action.actionKey !== 'string') {
    return [];
  }

  return [props.action.actionKey];
}

function extractActivityFeedActionKeys(props: Record<string, unknown>): string[] {
  const keys = new Set<string>();

  if (isRecord(props.action) && typeof props.action.actionKey === 'string') {
    keys.add(props.action.actionKey);
  }

  if (Array.isArray(props.items)) {
    for (const item of props.items) {
      if (!isRecord(item) || typeof item.actionKey !== 'string') {
        continue;
      }
      keys.add(item.actionKey);
    }
  }

  return Array.from(keys);
}

function extractDashboardPageActionKeys(props: Record<string, unknown>): string[] {
  const keys = new Set<string>();

  if (Array.isArray(props.actions)) {
    for (const action of props.actions) {
      if (!isRecord(action) || typeof action.actionKey !== 'string') {
        continue;
      }
      keys.add(action.actionKey);
    }
  }

  const widgetCollections = [props.kpis, props.primaryWidgets, props.secondaryWidgets];

  for (const collection of widgetCollections) {
    if (!Array.isArray(collection)) {
      continue;
    }

    for (const widget of collection) {
      if (!isRecord(widget) || !Array.isArray(widget.actions)) {
        continue;
      }

      for (const action of widget.actions) {
        if (!isRecord(action) || typeof action.actionKey !== 'string') {
          continue;
        }
        keys.add(action.actionKey);
      }
    }
  }

  return Array.from(keys);
}

function extractEmptyStateActionKeys(props: Record<string, unknown>): string[] {
  const keys = new Set<string>();

  if (isRecord(props.primaryAction) && typeof props.primaryAction.actionKey === 'string') {
    keys.add(props.primaryAction.actionKey);
  }

  if (isRecord(props.secondaryAction) && typeof props.secondaryAction.actionKey === 'string') {
    keys.add(props.secondaryAction.actionKey);
  }

  return Array.from(keys);
}

function extractErrorStateActionKeys(props: Record<string, unknown>): string[] {
  const keys = new Set<string>();

  if (isRecord(props.retryAction) && typeof props.retryAction.actionKey === 'string') {
    keys.add(props.retryAction.actionKey);
  }

  if (isRecord(props.secondaryAction) && typeof props.secondaryAction.actionKey === 'string') {
    keys.add(props.secondaryAction.actionKey);
  }

  return Array.from(keys);
}

function extractFilterBarActionKeys(props: Record<string, unknown>): string[] {
  if (!isRecord(props.clearAction) || typeof props.clearAction.actionKey !== 'string') {
    return [];
  }

  return [props.clearAction.actionKey];
}

function extractBulkCommandBarActionKeys(props: Record<string, unknown>): string[] {
  const keys = new Set<string>();

  const collect = (value: unknown) => {
    if (!Array.isArray(value)) {
      return;
    }

    for (const action of value) {
      if (!isRecord(action) || typeof action.key !== 'string') {
        continue;
      }
      keys.add(action.key);
    }
  };

  collect(props.actions);
  collect(props.overflowActions);

  if (isRecord(props.clearSelectionAction) && typeof props.clearSelectionAction.actionKey === 'string') {
    keys.add(props.clearSelectionAction.actionKey);
  }

  if (isRecord(props.selectAllResultsAction) && typeof props.selectAllResultsAction.actionKey === 'string') {
    keys.add(props.selectAllResultsAction.actionKey);
  }

  return Array.from(keys);
}

function extractDetailSectionCustomBlockKeys(props: Record<string, unknown>): string[] {
  const content = props.content;
  if (!isRecord(content) || content.mode !== 'custom-block') {
    return [];
  }

  if (typeof content.blockKey !== 'string') {
    return [];
  }

  return [content.blockKey];
}

function extractTabsActionKeys(props: Record<string, unknown>): string[] {
  if (!Array.isArray(props.items)) {
    return [];
  }

  const keys = new Set<string>();

  for (const item of props.items) {
    if (!isRecord(item) || typeof item.actionKey !== 'string') {
      continue;
    }

    keys.add(item.actionKey);
  }

  return Array.from(keys);
}

function extractCardListActionKeys(props: Record<string, unknown>): string[] {
  if (!isRecord(props.card) || !Array.isArray(props.card.actions)) {
    return [];
  }

  const keys = new Set<string>();

  for (const action of props.card.actions) {
    if (!isRecord(action) || typeof action.actionKey !== 'string') {
      continue;
    }

    keys.add(action.actionKey);
  }

  return Array.from(keys);
}

function buildPageHeaderRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const authorizedActionKeys = new Set(toStringArray(runtime.authorizedActionKeys));
  const hasExplicitAuthorization = authorizedActionKeys.size > 0;
  const lowerSlotContentText =
    typeof runtime.lowerSlotContentText === 'string'
      ? runtime.lowerSlotContentText
      : 'Overview | Contacts | Billing | Activity';

  const actionHandlers = Object.fromEntries(
    extractPageHeaderActionKeys(props).map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] page-header action', actionKey);
      },
    ]),
  );

  return {
    actionHandlers,
    isAuthorized: hasExplicitAuthorization ? (actionKey: string) => authorizedActionKeys.has(actionKey) : undefined,
    lowerSlotContent: {
      tabs: lowerSlotContentText,
      'summary-strip': lowerSlotContentText,
      'sub-navigation': lowerSlotContentText,
      'helper-content': lowerSlotContentText,
    },
  };
}

function buildDetailPageRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const declaredActionKeys = extractDetailPageActionKeys(props);
  const explicitActionKeys = toStringArray(runtime.actionHandlers);
  const actionKeys = explicitActionKeys.length > 0 ? explicitActionKeys : declaredActionKeys;

  const actionHandlers = Object.fromEntries(
    actionKeys.map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] detail-page action', actionKey);
      },
    ]),
  );

  const contentByKey = isRecord(runtime.contentByKey) ? runtime.contentByKey : undefined;

  return {
    actionHandlers,
    content: runtime.content !== undefined ? runtime.content : undefined,
    contentByKey,
  };
}

function buildMetricCardRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const declaredActionKeys = extractMetricCardActionKeys(props);
  const explicitActionKeys = toStringArray(runtime.actionHandlers);
  const actionKeys = explicitActionKeys.length > 0 ? explicitActionKeys : declaredActionKeys;

  const actionHandlers = Object.fromEntries(
    actionKeys.map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] metric-card action', actionKey);
      },
    ]),
  );

  return {
    ...runtime,
    actionHandlers,
    onAction: (actionKey: string) => {
      console.info('[playground] metric-card fallback action', actionKey);
    },
  };
}

function buildActivityFeedRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const declaredActionKeys = extractActivityFeedActionKeys(props);
  const explicitActionKeys = toStringArray(runtime.actionHandlers);
  const actionKeys = explicitActionKeys.length > 0 ? explicitActionKeys : declaredActionKeys;

  const actionHandlers = Object.fromEntries(
    actionKeys.map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] activity-feed action', actionKey);
      },
    ]),
  );

  return {
    ...runtime,
    actionHandlers,
    onAction: (actionKey: string) => {
      console.info('[playground] activity-feed fallback action', actionKey);
    },
    onFeedAction: (actionKey?: string) => {
      console.info('[playground] activity-feed header action', actionKey);
    },
    onItemAction: (itemKey: string, actionKey?: string) => {
      console.info('[playground] activity-feed item action', { itemKey, actionKey });
    },
  };
}

function buildDashboardPageRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const declaredActionKeys = extractDashboardPageActionKeys(props);
  const explicitActionKeys = toStringArray(runtime.actionHandlers);
  const actionKeys = explicitActionKeys.length > 0 ? explicitActionKeys : declaredActionKeys;

  const actionHandlers = Object.fromEntries(
    actionKeys.map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] dashboard-page action', actionKey);
      },
    ]),
  );

  return {
    actionHandlers,
    onAction: (actionKey: string) => {
      console.info('[playground] dashboard-page fallback action', actionKey);
    },
    widgetContentByWidgetKey: isRecord(runtime.widgetContentByWidgetKey) ? runtime.widgetContentByWidgetKey : undefined,
    widgetContentByRendererKey: isRecord(runtime.widgetContentByRendererKey)
      ? runtime.widgetContentByRendererKey
      : undefined,
  };
}

function buildDetailSectionRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const actionHandlers = Object.fromEntries(
    extractDetailSectionActionKeys(props).map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] detail-section action', actionKey);
      },
    ]),
  );

  const authorizedActionKeys = new Set(toStringArray(runtime.authorizedActionKeys));
  const hasExplicitAuthorization = authorizedActionKeys.size > 0;
  const linkBasePath =
    typeof runtime.linkBasePath === 'string' && runtime.linkBasePath.length > 0 ? runtime.linkBasePath : '/records';

  const customBlockText =
    typeof runtime.customBlockText === 'string' ? runtime.customBlockText : 'Runtime custom block content';

  const customBlockContent = Object.fromEntries(
    extractDetailSectionCustomBlockKeys(props).map((blockKey) => [blockKey, customBlockText]),
  );

  return {
    data: isRecord(runtime.data) ? runtime.data : {},
    actionHandlers,
    isAuthorized: hasExplicitAuthorization ? (actionKey: string) => authorizedActionKeys.has(actionKey) : undefined,
    customBlockContent,
    getFieldHref: (_field: string, value: unknown) => {
      if (value === null || value === undefined || value === '') {
        return undefined;
      }

      return `${linkBasePath}/${encodeURIComponent(String(value))}`;
    },
  };
}

function buildDetailItemRuntime(runtime: Record<string, unknown>) {
  const linkBasePath =
    typeof runtime.linkBasePath === 'string' && runtime.linkBasePath.length > 0 ? runtime.linkBasePath : '/records';

  return {
    data: isRecord(runtime.data) ? runtime.data : {},
    resolveHref: ({ kind, value }: { kind: string; field: string; value: unknown }) => {
      if (kind !== 'link' && kind !== 'user-reference' && kind !== 'entity-reference') {
        return undefined;
      }

      if (value === null || value === undefined || value === '') {
        return undefined;
      }

      if (isRecord(value) && typeof value.href === 'string') {
        return value.href;
      }

      if (isRecord(value) && typeof value.url === 'string') {
        return value.url;
      }

      if (typeof value === 'string') {
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
          return value;
        }

        return `${linkBasePath}/${encodeURIComponent(value)}`;
      }

      if (isRecord(value) && (typeof value.id === 'string' || typeof value.id === 'number')) {
        return `${linkBasePath}/${encodeURIComponent(String(value.id))}`;
      }

      return undefined;
    },
  };
}

function buildEmptyStateRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const actionHandlers = Object.fromEntries(
    extractEmptyStateActionKeys(props).map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] empty-state action', actionKey);
      },
    ]),
  );

  return {
    ...runtime,
    actionHandlers,
  };
}

function buildErrorStateRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const actionHandlers = Object.fromEntries(
    extractErrorStateActionKeys(props).map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] error-state action', actionKey);
      },
    ]),
  );

  return {
    ...runtime,
    actionHandlers,
    showTechnicalDetails: runtime.showTechnicalDetails === true,
  };
}

function buildFilterBarRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const actionHandlers = Object.fromEntries(
    extractFilterBarActionKeys(props).map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] filter-bar action', actionKey);
      },
    ]),
  );

  return {
    ...runtime,
    actionHandlers,
    onSearchChange: (value: string) => {
      console.info('[playground] filter-bar search changed', value);
    },
    onFilterChange: (key: string, value: unknown) => {
      console.info('[playground] filter-bar filter changed', { key, value });
    },
    onSortChange: (value: string) => {
      console.info('[playground] filter-bar sort changed', value);
    },
    onRemoveActiveFilter: (key: string) => {
      console.info('[playground] filter-bar remove active filter', key);
    },
    onAdvancedToggle: (open: boolean) => {
      console.info('[playground] filter-bar advanced toggle', open);
    },
    onClear: () => {
      console.info('[playground] filter-bar clear action');
    },
  };
}

function buildBulkCommandBarRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const actionHandlers = Object.fromEntries(
    extractBulkCommandBarActionKeys(props).map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] bulk-command-bar action', actionKey);
      },
    ]),
  );

  return {
    ...runtime,
    actionHandlers,
    onAction: (actionKey: string) => {
      console.info('[playground] bulk-command-bar onAction', actionKey);
    },
    onClearSelection: () => {
      console.info('[playground] bulk-command-bar clear selection');
    },
    onSelectAllResults: () => {
      console.info('[playground] bulk-command-bar select all results');
    },
  };
}

function buildTabsRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const actionHandlers = Object.fromEntries(
    extractTabsActionKeys(props).map((actionKey) => [
      actionKey,
      () => {
        console.info('[playground] tabs action', actionKey);
      },
    ]),
  );

  const authorizedActionKeys = new Set(toStringArray(runtime.authorizedActionKeys));
  const hasExplicitAuthorization = authorizedActionKeys.size > 0;

  return {
    actionHandlers,
    isAuthorized: hasExplicitAuthorization ? (actionKey: string) => authorizedActionKeys.has(actionKey) : undefined,
  };
}

function buildCardListRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const records = Array.isArray(runtime.records) ? runtime.records : [];
  const actionHandlers = Object.fromEntries(
    extractCardListActionKeys(props).map((actionKey) => [
      actionKey,
      (record: unknown) => {
        console.info('[playground] card-list action', actionKey, record);
      },
    ]),
  );

  const authorizedActionKeys = new Set(toStringArray(runtime.authorizedActionKeys));
  const hasExplicitAuthorization = authorizedActionKeys.size > 0;
  const linkBasePath =
    typeof runtime.linkBasePath === 'string' && runtime.linkBasePath.length > 0 ? runtime.linkBasePath : '/records';

  return {
    records,
    loading: Boolean(runtime.loading),
    actionHandlers,
    isAuthorized: hasExplicitAuthorization ? (actionKey: string) => authorizedActionKeys.has(actionKey) : undefined,
    getFieldHref: ({ value }: { value: unknown }) => {
      if (value === null || value === undefined || value === '') {
        return undefined;
      }

      return `${linkBasePath}/${encodeURIComponent(String(value))}`;
    },
  };
}

function buildListPageRuntime(runtime: Record<string, unknown>, props: Record<string, unknown>) {
  const headerProps = isRecord(props.header) ? props.header : {};
  const navigationProps = isRecord(props.navigation) ? props.navigation : {};
  const rendererProps = isRecord(props.renderer) ? props.renderer : {};
  const rendererPresentation = isRecord(rendererProps.presentation) ? rendererProps.presentation : {};

  const headerRuntimeInput = isRecord(runtime.headerRuntime) ? runtime.headerRuntime : {};
  const navigationRuntimeInput = isRecord(runtime.navigationRuntime) ? runtime.navigationRuntime : {};
  const rendererRuntimeInput = isRecord(runtime.rendererRuntime) ? runtime.rendererRuntime : {};
  const paginationRuntimeInput = isRecord(runtime.paginationRuntime) ? runtime.paginationRuntime : {};
  const controlsRuntimeInput = isRecord(runtime.controlsRuntime) ? runtime.controlsRuntime : {};

  const bulkActionInput = Array.isArray(controlsRuntimeInput.bulkActions) ? controlsRuntimeInput.bulkActions : [];

  const bulkActions = bulkActionInput
    .filter((action): action is Record<string, unknown> => isRecord(action))
    .map((action, index) => {
      const key = typeof action.key === 'string' && action.key.length > 0 ? action.key : `bulk-action-${index + 1}`;
      const label = typeof action.label === 'string' && action.label.length > 0 ? action.label : `Action ${index + 1}`;

      const intent =
        action.intent === 'default' || action.intent === 'neutral' || action.intent === 'danger'
          ? action.intent
          : undefined;

      return {
        key,
        label,
        intent,
        disabled: typeof action.disabled === 'boolean' ? action.disabled : undefined,
        onClick: () => {
          console.info('[playground] list-page bulk action', key);
        },
      };
    });

  const rendererRuntime =
    rendererProps.mode === 'card-list'
      ? buildCardListRuntime(rendererRuntimeInput, rendererPresentation)
      : buildDataGridRuntime(rendererRuntimeInput);

  return {
    headerRuntime: buildPageHeaderRuntime(headerRuntimeInput, headerProps),
    navigationRuntime: buildTabsRuntime(navigationRuntimeInput, navigationProps),
    rendererRuntime,
    controlsRuntime: {
      searchValue: typeof controlsRuntimeInput.searchValue === 'string' ? controlsRuntimeInput.searchValue : '',
      onSearchChange: (value: string) => {
        console.info('[playground] list-page search changed', value);
      },
      sortingLabel:
        typeof controlsRuntimeInput.sortingLabel === 'string' ? controlsRuntimeInput.sortingLabel : undefined,
      bulkActions,
      bulkActionsVisible:
        typeof controlsRuntimeInput.bulkActionsVisible === 'boolean'
          ? controlsRuntimeInput.bulkActionsVisible
          : undefined,
    },
    paginationRuntime: buildPaginationRuntime(paginationRuntimeInput),
    loading: Boolean(runtime.loading),
    errorState: typeof runtime.errorState === 'string' ? runtime.errorState : undefined,
  };
}

function buildPreviewRuntime(
  primitive: string,
  runtime: Record<string, unknown>,
  props: Record<string, unknown>,
): unknown {
  if (primitive === 'data-grid') {
    return buildDataGridRuntime(runtime);
  }

  if (primitive === 'pagination') {
    return buildPaginationRuntime(runtime);
  }

  if (primitive === 'page-header') {
    return buildPageHeaderRuntime(runtime, props);
  }

  if (primitive === 'detail-page') {
    return buildDetailPageRuntime(runtime, props);
  }

  if (primitive === 'metric-card') {
    return buildMetricCardRuntime(runtime, props);
  }

  if (primitive === 'activity-feed') {
    return buildActivityFeedRuntime(runtime, props);
  }

  if (primitive === 'dashboard-page') {
    return buildDashboardPageRuntime(runtime, props);
  }

  if (primitive === 'detail-section') {
    return buildDetailSectionRuntime(runtime, props);
  }

  if (primitive === 'detail-item') {
    return buildDetailItemRuntime(runtime);
  }

  if (primitive === 'empty-state') {
    return buildEmptyStateRuntime(runtime, props);
  }

  if (primitive === 'error-state') {
    return buildErrorStateRuntime(runtime, props);
  }

  if (primitive === 'filter-bar') {
    return buildFilterBarRuntime(runtime, props);
  }

  if (primitive === 'bulk-command-bar') {
    return buildBulkCommandBarRuntime(runtime, props);
  }

  if (primitive === 'tabs') {
    return buildTabsRuntime(runtime, props);
  }

  if (primitive === 'card-list') {
    return buildCardListRuntime(runtime, props);
  }

  if (primitive === 'list-page') {
    return buildListPageRuntime(runtime, props);
  }

  if (primitive === 'form-field') {
    return buildFormFieldRuntime(runtime);
  }

  if (primitive === 'input') {
    return buildInputRuntime(runtime);
  }

  if (primitive === 'textarea') {
    return buildTextareaRuntime(runtime);
  }

  if (primitive === 'select') {
    return buildSelectRuntime(runtime);
  }

  if (primitive === 'checkbox') {
    return buildCheckboxRuntime(runtime);
  }

  if (primitive === 'radio-group') {
    return buildRadioGroupRuntime(runtime);
  }

  if (primitive === 'toggle') {
    return buildToggleRuntime(runtime);
  }

  if (primitive === 'date-input') {
    return buildDateInputRuntime(runtime);
  }

  if (primitive === 'form-section') {
    return buildFormSectionRuntime(runtime, props);
  }

  if (primitive === 'form') {
    return buildFormRuntime(runtime, props);
  }

  return runtime;
}

function EditorPanel({
  label,
  value,
  error,
  collapsed,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  error: string | null;
  collapsed: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className={`flex flex-col border-b border-gray-200 dark:border-gray-700 ${
        collapsed ? 'shrink-0' : 'flex-1 min-h-[180px]'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-left text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          {label}
        </button>
        {error && <span className="text-xs text-red-500 dark:text-red-400 truncate ml-4 max-w-[160px]">{error}</span>}
      </div>
      {!collapsed && (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="flex-1 resize-none p-4 font-mono text-xs bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 focus:outline-none"
        />
      )}
    </div>
  );
}

type RightTab = 'preview' | 'runtime' | 'documentation' | 'registry';

const RIGHT_TABS: { key: RightTab; label: string }[] = [
  { key: 'preview', label: 'Preview' },
  { key: 'runtime', label: 'Runtime' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'registry', label: 'Registry' },
];

interface RuntimePageProps {
  primitive?: string;
  backPath?: string;
}

export function RuntimePage({ primitive, backPath = '/' }: RuntimePageProps) {
  const navigate = useNavigate();
  const runtimeRootPath = toTabPath('primitives');

  const demo = primitive && PRIMITIVE_DEMOS[primitive] ? PRIMITIVE_DEMOS[primitive] : DEFAULT_DEMO;

  const [propsState, onPropsChange] = useJsonState<Record<string, unknown>>(demo.props);
  const [runtimeState, onRuntimeChange] = useJsonState<Record<string, unknown>>(demo.runtime);
  const [rightTab, setRightTab] = useState<RightTab>('preview');
  const [documentationState, setDocumentationState] = useState<'idle' | 'loading' | 'loaded' | 'missing'>('idle');
  const [documentationMarkdown, setDocumentationMarkdown] = useState<string | null>(null);
  const [collapsedPanels, setCollapsedPanels] = useState({
    props: false,
    runtime: false,
  });

  const previewRuntime = useMemo(
    () => buildPreviewRuntime(demo.primitive, runtimeState.live, propsState.live),
    [demo.primitive, runtimeState.live, propsState.live],
  );

  const propsType = typeof propsState.live.type === 'string' ? propsState.live.type : 'unknown';
  const hasTypeMismatch = propsType !== demo.contractType;

  const registeredPrimitives = useMemo(
    () =>
      listPrimitives()
        .map((entry) => entry.name)
        .filter((name) => isDemoPrimitiveVisible(name))
        .sort((a, b) => a.localeCompare(b)),
    [],
  );

  const documentationLoader = useMemo(
    () => resolvePrimitiveDocumentationLoader(demo.primitive, demo.contractType),
    [demo.primitive, demo.contractType],
  );

  useEffect(() => {
    let isCancelled = false;

    if (!documentationLoader) {
      setDocumentationState('missing');
      setDocumentationMarkdown(null);
      return () => {
        isCancelled = true;
      };
    }

    setDocumentationState('loading');
    setDocumentationMarkdown(null);

    void documentationLoader()
      .then((markdown) => {
        if (isCancelled) {
          return;
        }

        if (typeof markdown !== 'string' || markdown.length === 0) {
          setDocumentationState('missing');
          setDocumentationMarkdown(null);
          return;
        }

        setDocumentationState('loaded');
        setDocumentationMarkdown(markdown);
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setDocumentationState('missing');
        setDocumentationMarkdown(null);
      });

    return () => {
      isCancelled = true;
    };
  }, [documentationLoader]);

  function togglePanel(panel: 'props' | 'runtime') {
    setCollapsedPanels((current) => ({
      ...current,
      [panel]: !current[panel],
    }));
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft size={16} />
          Runtime
        </button>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{demo.label}</span>
        {demo.description && (
          <>
            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">/</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">{demo.description}</span>
          </>
        )}
        <span
          className={`ml-auto rounded px-2 py-0.5 font-mono text-[10px] ${
            hasTypeMismatch
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
          }`}
        >
          contract.type={demo.contractType} | props.type={propsType}
        </span>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-2/5 flex flex-col border-r border-gray-200 dark:border-gray-700 min-h-0">
          <EditorPanel
            label="Props (Contract JSON)"
            value={propsState.text}
            error={propsState.error}
            collapsed={collapsedPanels.props}
            onToggle={() => togglePanel('props')}
            onChange={onPropsChange}
          />
          <EditorPanel
            label="Runtime (Preview State)"
            value={runtimeState.text}
            error={runtimeState.error}
            collapsed={collapsedPanels.runtime}
            onToggle={() => togglePanel('runtime')}
            onChange={onRuntimeChange}
          />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
            {RIGHT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRightTab(tab.key)}
                className={`px-5 py-2.5 text-xs font-medium transition-colors ${
                  rightTab === tab.key
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {rightTab === 'preview' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden p-4">
                <PrimitiveRenderer primitive={demo.primitive} props={propsState.live} runtime={previewRuntime} />
              </div>
            </div>
          )}

          {rightTab === 'runtime' && (
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="font-mono text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                {JSON.stringify(runtimeState.live, null, 2)}
              </pre>
            </div>
          )}

          {rightTab === 'documentation' && (
            <div className="flex-1 overflow-y-auto p-4">
              {documentationState === 'loading' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Loading primitive documentation…</p>
              )}

              {documentationState === 'missing' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No primitive markdown documentation file was found for this runtime primitive.
                </p>
              )}

              {documentationState === 'loaded' && documentationMarkdown && (
                <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 overflow-auto max-h-full">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0 mb-3">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-5 mb-2">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-xs leading-6 text-gray-800 dark:text-gray-200 mb-3">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 space-y-1 text-xs text-gray-800 dark:text-gray-200 mb-3">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-800 dark:text-gray-200 mb-3">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li className="leading-6">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 italic text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {children}
                        </blockquote>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 underline underline-offset-2 break-all"
                        >
                          {children}
                        </a>
                      ),
                      code: ({ children, className }) => (
                        <code
                          className={
                            className
                              ? `font-mono text-[11px] text-gray-800 dark:text-gray-200 ${className}`
                              : 'rounded bg-gray-200 dark:bg-gray-700 px-1 py-0.5 font-mono text-[11px] text-gray-900 dark:text-gray-100'
                          }
                        >
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 overflow-x-auto text-[11px] mb-3">
                          {children}
                        </pre>
                      ),
                      hr: () => <hr className="border-gray-200 dark:border-gray-700 my-4" />,
                      table: ({ children }) => (
                        <div className="overflow-x-auto mb-3">
                          <table className="w-full text-xs border border-gray-200 dark:border-gray-700">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-2 py-1.5 text-left font-semibold text-gray-900 dark:text-gray-100">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 align-top text-gray-800 dark:text-gray-200">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {documentationMarkdown}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {rightTab === 'registry' && (
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                Registered Runtime Primitives ({registeredPrimitives.length})
              </p>
              <div className="flex flex-col gap-1">
                {registeredPrimitives.map((name) => {
                  const runtimeDemoPath = getRuntimePathForPrimitive(name);
                  const hasRuntimeDemo = runtimeDemoPath !== runtimeRootPath;

                  return (
                    <div key={name} className="flex items-center justify-between gap-3 py-0.5">
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{name}</span>
                      <button
                        type="button"
                        disabled={!hasRuntimeDemo}
                        onClick={() => hasRuntimeDemo && navigate(runtimeDemoPath)}
                        className={`text-[11px] ${
                          hasRuntimeDemo
                            ? 'text-blue-600 dark:text-blue-400 hover:underline'
                            : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {hasRuntimeDemo ? 'Open demo' : 'No demo'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
