import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { DetailSectionPresentation, FieldValuePresentation } from '@ikary-manifest/presentation';
import { buildFieldValueViewModel } from '../field-value/FieldValue.adapter';
import { FieldValue } from '../field-value/FieldValue';
import type {
  DetailSectionResolvedAction,
  DetailSectionResolvedCallout,
  DetailSectionResolvedFieldItem,
  DetailSectionResolvedMetricItem,
  DetailSectionValueType,
  DetailSectionViewProps,
} from './DetailSection.types';

type DetailSectionFormatters = {
  number?: (value: unknown) => string;
  currency?: (value: unknown) => string;
  date?: (value: unknown) => string;
  datetime?: (value: unknown) => string;
};

export type BuildDetailSectionViewModelInput = {
  presentation: DetailSectionPresentation;

  /**
   * Source object used to resolve field paths such as:
   * - "name"
   * - "owner.email"
   * - "billing.address.city"
   */
  data?: Record<string, unknown>;

  /**
   * Section-level action handlers keyed by actionKey.
   */
  actionHandlers?: Record<string, () => void>;

  /**
   * Optional authorization helper.
   * Used only when hiddenWhenUnauthorized is set.
   */
  isAuthorized?: (actionKey: string) => boolean;

  /**
   * Optional content for custom-block mode, keyed by blockKey.
   */
  customBlockContent?: Record<string, ReactNode>;

  /**
   * Optional link resolver for fields rendered as links.
   */
  getFieldHref?: (field: string, value: unknown) => string | undefined;

  /**
   * Deprecated: value formatting now flows through the shared FieldValue primitive.
   * Kept for compatibility with existing resolver runtime inputs.
   */
  formatters?: DetailSectionFormatters;
};

export function buildDetailSectionViewModel(input: BuildDetailSectionViewModelInput): DetailSectionViewProps {
  return {
    title: input.presentation.title,
    description: input.presentation.description,
    actions: input.presentation.actions?.map((action) => resolveAction(action, input)),
    content: resolveContent(input),
    emphasis: input.presentation.emphasis,
    dense: input.presentation.dense,
  };
}

function resolveAction(
  action: NonNullable<DetailSectionPresentation['actions']>[number],
  input: BuildDetailSectionViewModelInput,
): DetailSectionResolvedAction {
  const authorized = resolveAuthorization(action.actionKey, input);
  const hidden = action.hiddenWhenUnauthorized === true && authorized === false;

  const resolved: DetailSectionResolvedAction = {
    key: action.key,
    label: action.label,
    icon: action.icon,
    intent: action.intent,
    href: action.href,
    disabled: action.disabled,
    hidden,
  };

  if (action.actionKey) {
    const handler = input.actionHandlers?.[action.actionKey];
    resolved.onClick = handler;
    resolved.disabled = action.disabled ?? typeof handler !== 'function';
  }

  return resolved;
}

function resolveContent(input: BuildDetailSectionViewModelInput): DetailSectionViewProps['content'] {
  const content = input.presentation.content;

  switch (content.mode) {
    case 'field-list':
      return {
        mode: 'field-list',
        items: content.items.map((item) => resolveFieldItem(item, input)),
        emptyState: content.emptyState,
      };

    case 'field-grid':
      return {
        mode: 'field-grid',
        columns: normalizeFieldGridColumns(content.columns),
        items: content.items.map((item) => resolveFieldItem(item, input)),
        emptyState: content.emptyState,
      };

    case 'metric-list':
      return {
        mode: 'metric-list',
        items: content.items.map((item) => resolveMetricItem(item, input)),
        emptyState: content.emptyState,
      };

    case 'callout':
      return {
        mode: 'callout',
        callout: resolveCallout(content.callout),
      };

    case 'custom-block':
      return {
        mode: 'custom-block',
        content: input.customBlockContent?.[content.blockKey],
        emptyState: content.emptyState,
      };

    default:
      return assertNever(content);
  }
}

function resolveFieldItem(
  item:
    | Extract<DetailSectionPresentation['content'], { mode: 'field-list' }>['items'][number]
    | Extract<DetailSectionPresentation['content'], { mode: 'field-grid' }>['items'][number],
  input: BuildDetailSectionViewModelInput,
): DetailSectionResolvedFieldItem {
  const raw = getValue(input.data, item.field);
  const valueType = item.valueType ?? 'text';
  const href = valueType === 'link' ? input.getFieldHref?.(item.field, raw) : undefined;

  return {
    key: item.key,
    label: item.label,
    value: buildFieldValueNode({
      value: raw,
      valueType,
      emptyLabel: item.emptyLabel,
      href,
      dense: input.presentation.dense,
    }),
    valueType,
    icon: item.icon,
    tooltip: item.tooltip,
    empty: isEmptyValue(raw),
  };
}

function resolveMetricItem(
  item: Extract<DetailSectionPresentation['content'], { mode: 'metric-list' }>['items'][number],
  input: BuildDetailSectionViewModelInput,
): DetailSectionResolvedMetricItem {
  const raw = getValue(input.data, item.field);
  const valueType = item.valueType ?? 'text';

  return {
    key: item.key,
    label: item.label,
    value: buildFieldValueNode({
      value: raw,
      valueType,
      dense: input.presentation.dense,
    }),
    supportingText: item.supportingText,
  };
}

function buildFieldValueNode(input: {
  value: unknown;
  valueType: DetailSectionValueType | 'text' | 'number' | 'currency';
  emptyLabel?: string;
  href?: string;
  dense?: boolean;
}): ReactNode {
  const presentation: FieldValuePresentation = {
    type: 'field-value',
    valueType: input.valueType,
    emptyLabel: input.emptyLabel,
    dense: input.dense ?? false,
  };

  if (input.valueType === 'link') {
    presentation.link = {
      target: 'internal',
    };
  }

  return createElement(
    FieldValue,
    buildFieldValueViewModel({
      presentation,
      value: input.value,
      href: input.href,
    }),
  );
}

function resolveCallout(
  callout: Extract<DetailSectionPresentation['content'], { mode: 'callout' }>['callout'],
): DetailSectionResolvedCallout {
  return {
    tone: callout.tone,
    title: callout.title,
    description: callout.description,
  };
}

function resolveAuthorization(
  actionKey: string | undefined,
  input: BuildDetailSectionViewModelInput,
): boolean | undefined {
  if (!actionKey) return undefined;
  if (!input.isAuthorized) return undefined;
  return input.isAuthorized(actionKey);
}

function getValue(input: Record<string, unknown> | undefined, path: string): unknown {
  if (!input) return undefined;
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

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function normalizeFieldGridColumns(value: number | undefined): 2 | 3 | undefined {
  if (value === 2 || value === 3) {
    return value;
  }

  return undefined;
}

function assertNever(value: never): never {
  throw new Error(`Unsupported DetailSection content mode: ${String(value)}`);
}
