import type { DetailItem as DetailItemPresentation, FieldValuePresentation } from '@ikary/cell-presentation';
import { buildFieldValueViewModel } from '../field-value/FieldValue.adapter';
import type {
  DetailItemBadgeListViewProps,
  DetailItemFieldValueViewProps,
  DetailItemKind,
  DetailItemListSummaryViewProps,
  DetailItemReferenceView,
  DetailItemReferenceViewProps,
  DetailItemViewProps,
} from './DetailItem.types';

type DetailItemReferenceLike = {
  id?: unknown;
  label?: unknown;
  name?: unknown;
  title?: unknown;
  displayName?: unknown;
  email?: unknown;
  href?: unknown;
  url?: unknown;
};

export type BuildDetailItemViewModelInput = {
  presentation: DetailItemPresentation;
  data?: Record<string, unknown>;
  resolveHref?: (input: { kind: DetailItemKind; field: string; value: unknown }) => string | undefined;
};

type DetailItemCommonViewProps = {
  key: string;
  label: string;
  dense: boolean;
  loading: boolean;
  errorLabel?: string;
  testId?: string;
  labelId: string;
  valueId: string;
};

type DetailItemFieldValuePresentation = Extract<
  DetailItemPresentation,
  {
    kind: 'text' | 'long-text' | 'date' | 'datetime' | 'boolean' | 'status' | 'link';
  }
>;

type DetailItemBadgeListPresentation = Extract<DetailItemPresentation, { kind: 'badge-list' }>;

type DetailItemReferencePresentation = Extract<DetailItemPresentation, { kind: 'user-reference' | 'entity-reference' }>;

type DetailItemListSummaryPresentation = Extract<DetailItemPresentation, { kind: 'list-summary' }>;

export function buildDetailItemViewModel(input: BuildDetailItemViewModelInput): DetailItemViewProps {
  const rawValue = getValue(input.data, input.presentation.field);
  const ids = resolveIds(input.presentation.key);

  const common: DetailItemCommonViewProps = {
    key: input.presentation.key,
    label: input.presentation.label,
    dense: input.presentation.dense ?? false,
    loading: input.presentation.loading ?? false,
    errorLabel: input.presentation.errorLabel,
    testId: input.presentation.testId,
    labelId: ids.labelId,
    valueId: ids.valueId,
  };

  switch (input.presentation.kind) {
    case 'badge-list':
      return buildBadgeListView(common, rawValue, input.presentation);

    case 'user-reference':
    case 'entity-reference':
      return buildReferenceView(common, rawValue, input.presentation, input);

    case 'list-summary':
      return buildListSummaryView(common, rawValue, input.presentation);

    case 'text':
    case 'long-text':
    case 'date':
    case 'datetime':
    case 'boolean':
    case 'status':
    case 'link':
      return buildFieldValueView(common, rawValue, input.presentation, input);

    default:
      return assertNever(input.presentation);
  }
}

function buildFieldValueView(
  common: DetailItemCommonViewProps,
  rawValue: unknown,
  presentation: DetailItemFieldValuePresentation,
  input: BuildDetailItemViewModelInput,
): DetailItemFieldValueViewProps {
  const fieldValuePresentation = toFieldValuePresentation(presentation);
  const href =
    presentation.kind === 'link' ? resolveHref(presentation.kind, presentation.field, rawValue, input) : undefined;

  let value = normalizeLinkLabel(rawValue);

  if (presentation.kind === 'boolean' && presentation.labels) {
    const trueLabel = presentation.labels.trueLabel ?? 'Yes';
    const falseLabel = presentation.labels.falseLabel ?? 'No';

    value = isEmptyValue(rawValue) ? rawValue : rawValue ? trueLabel : falseLabel;
    fieldValuePresentation.valueType = 'text';
  }

  return {
    ...common,
    kind: presentation.kind,
    valueView: buildFieldValueViewModel({
      presentation: fieldValuePresentation,
      value,
      href,
    }),
  };
}

function buildBadgeListView(
  common: DetailItemCommonViewProps,
  rawValue: unknown,
  presentation: DetailItemBadgeListPresentation,
): DetailItemBadgeListViewProps {
  const labels = toStringList(rawValue);
  const maxVisible = presentation.maxVisible ?? 6;
  const visibleLabels = labels.slice(0, maxVisible);

  return {
    ...common,
    kind: 'badge-list',
    badges: visibleLabels.map((label, index) => ({
      key: `${common.key}-badge-${index + 1}`,
      label,
      tone: presentation.tone,
    })),
    overflowCount: Math.max(0, labels.length - visibleLabels.length),
    emptyLabel: normalizeEmptyLabel(presentation.emptyLabel),
  };
}

function buildReferenceView(
  common: DetailItemCommonViewProps,
  rawValue: unknown,
  presentation: DetailItemReferencePresentation,
  input: BuildDetailItemViewModelInput,
): DetailItemReferenceViewProps {
  const reference = resolveReference(
    rawValue,
    presentation.kind,
    presentation.field,
    input,
    presentation.showSecondary ?? false,
  );

  return {
    ...common,
    kind: presentation.kind,
    reference,
    emptyLabel: normalizeEmptyLabel(presentation.emptyLabel),
  };
}

function buildListSummaryView(
  common: DetailItemCommonViewProps,
  rawValue: unknown,
  presentation: DetailItemListSummaryPresentation,
): DetailItemListSummaryViewProps {
  const values = toStringList(rawValue);
  const maxVisible = presentation.maxVisible ?? 3;
  const visible = values.slice(0, maxVisible);

  return {
    ...common,
    kind: 'list-summary',
    items: visible,
    maxVisible,
    overflowCount: Math.max(0, values.length - visible.length),
    emptyLabel: normalizeEmptyLabel(presentation.emptyLabel),
  };
}

function toFieldValuePresentation(presentation: DetailItemFieldValuePresentation): FieldValuePresentation {
  const valueType = presentation.kind === 'long-text' ? 'text' : presentation.kind;

  const fieldValuePresentation: FieldValuePresentation = {
    type: 'field-value',
    valueType,
    emptyLabel: presentation.emptyLabel,
    truncate: presentation.kind === 'long-text' ? false : presentation.truncate,
    tooltip: presentation.tooltip,
    dense: presentation.dense,
  };

  if (presentation.kind === 'date' && presentation.format?.dateStyle) {
    fieldValuePresentation.format = {
      dateStyle: presentation.format.dateStyle,
    };
  }

  if (presentation.kind === 'datetime' && presentation.format?.datetimeStyle) {
    fieldValuePresentation.format = {
      datetimeStyle: presentation.format.datetimeStyle,
    };
  }

  if (presentation.kind === 'status' && presentation.tone) {
    fieldValuePresentation.tone = presentation.tone;
  }

  if (presentation.kind === 'link') {
    fieldValuePresentation.link = {
      target: presentation.link?.target,
    };
  }

  return fieldValuePresentation;
}

function resolveReference(
  value: unknown,
  kind: 'user-reference' | 'entity-reference',
  field: string,
  input: BuildDetailItemViewModelInput,
  showSecondary: boolean,
): DetailItemReferenceView | undefined {
  if (isEmptyValue(value)) {
    return undefined;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const label = String(value);
    const href = resolveHref(kind, field, value, input);

    return {
      label,
      href,
    };
  }

  if (!isRecord(value)) {
    return {
      label: String(value),
    };
  }

  const referenceValue = value as DetailItemReferenceLike;
  const label = firstMeaningfulText([
    referenceValue.displayName,
    referenceValue.name,
    referenceValue.label,
    referenceValue.title,
    referenceValue.email,
    referenceValue.id,
  ]);

  if (!label) {
    return undefined;
  }

  const href = resolveHref(kind, field, value, input) ?? firstMeaningfulText([referenceValue.href, referenceValue.url]);

  const secondaryCandidate =
    kind === 'user-reference'
      ? firstMeaningfulText([referenceValue.email, referenceValue.id])
      : firstMeaningfulText([referenceValue.id]);

  const secondaryLabel =
    showSecondary && secondaryCandidate && secondaryCandidate !== label ? secondaryCandidate : undefined;

  return {
    label,
    secondaryLabel,
    href,
  };
}

function resolveHref(
  kind: DetailItemKind,
  field: string,
  value: unknown,
  input: BuildDetailItemViewModelInput,
): string | undefined {
  const fromRuntime = input.resolveHref?.({
    kind,
    field,
    value,
  });

  if (fromRuntime) {
    return fromRuntime;
  }

  if (isRecord(value)) {
    const hrefCandidate = firstMeaningfulText([value.href, value.url]);

    if (hrefCandidate) {
      return hrefCandidate;
    }
  }

  if (typeof value === 'string' && isLikelyHref(value)) {
    return value;
  }

  return undefined;
}

function normalizeLinkLabel(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  return firstMeaningfulText([value.label, value.name, value.title, value.href, value.url]) ?? value;
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'number') return String(item);
        if (isRecord(item)) {
          return firstMeaningfulText([item.label, item.name, item.title, item.value]);
        }

        return undefined;
      })
      .filter((item): item is string => Boolean(item && item.trim().length > 0));
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function normalizeEmptyLabel(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : '—';
}

function resolveIds(key: string): {
  labelId: string;
  valueId: string;
} {
  const safeKey = key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');

  return {
    labelId: `detail-item-${safeKey}-label`,
    valueId: `detail-item-${safeKey}-value`,
  };
}

function getValue(input: Record<string, unknown> | undefined, path: string): unknown {
  if (!input) return undefined;
  if (!path) return undefined;

  const segments = path.split('.');
  let current: unknown = input;

  for (const segment of segments) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function firstMeaningfulText(values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return undefined;
}

function isLikelyHref(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
}

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function assertNever(value: never): never {
  throw new Error(`Unsupported detail item kind: ${String(value)}`);
}
