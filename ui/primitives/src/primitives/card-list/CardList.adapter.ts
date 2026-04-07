import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { CardListPresentation } from '@ikary/presentation';
import { FieldValue, buildFieldValueViewModel } from '../field-value';
import type {
  CardListResolvedAction,
  CardListResolvedBadge,
  CardListResolvedCard,
  CardListResolvedField,
  CardListResolvedMetric,
  CardListViewProps,
} from './CardList.types';

type CardRecord = Record<string, unknown>;

export type BuildCardListViewModelInput<TRecord extends CardRecord = CardRecord> = {
  presentation: CardListPresentation;
  records: TRecord[];

  /**
   * Optional stable key resolver for each card.
   * Falls back to record.id, record.key, then index.
   */
  getRecordKey?: (record: TRecord, index: number) => string;

  /**
   * Optional runtime action handlers keyed by actionKey.
   */
  actionHandlers?: Record<string, (record: TRecord) => void>;

  /**
   * Optional authorization helper.
   * Used only when hiddenWhenUnauthorized is set.
   */
  isAuthorized?: (actionKey: string, record: TRecord) => boolean;

  /**
   * Optional href resolver for field values rendered as links.
   */
  getFieldHref?: (args: { record: TRecord; field: string; value: unknown }) => string | undefined;

  /**
   * Optional href resolver for card actions using href templates or runtime rules.
   * If not provided, the raw href from contract is used.
   */
  getActionHref?: (args: { record: TRecord; href: string; actionKey?: string }) => string | undefined;

  loading?: boolean;
};

export function buildCardListViewModel<TRecord extends CardRecord = CardRecord>(
  input: BuildCardListViewModelInput<TRecord>,
): CardListViewProps<TRecord> {
  return {
    items: (input.records ?? []).map((record, index) => resolveCard(record, index, input)),
    columns: input.presentation.layout?.columns,
    emptyState: input.presentation.emptyState,
    dense: input.presentation.dense ?? false,
    loading: input.loading,
  };
}

function resolveCard<TRecord extends CardRecord>(
  record: TRecord,
  index: number,
  input: BuildCardListViewModelInput<TRecord>,
): CardListResolvedCard<TRecord> {
  const card = input.presentation.card;

  const titleRaw = getValue(record, card.titleField);
  const subtitleRaw = card.subtitleField ? getValue(record, card.subtitleField) : undefined;

  return {
    key: resolveRecordKey(record, index, input.getRecordKey),
    record,
    title: renderTextValue(titleRaw),
    subtitle: subtitleRaw !== undefined ? renderTextValue(subtitleRaw) : undefined,
    badge: card.badge ? resolveBadge(card.badge, record, input) : undefined,
    fields: card.fields?.map((field) => resolveField(field, record, input)),
    metrics: card.metrics?.map((metric) => resolveMetric(metric, record)),
    actions: card.actions?.map((action) => resolveAction(action, record, input)),
  };
}

function resolveBadge<TRecord extends CardRecord>(
  badge: NonNullable<CardListPresentation['card']['badge']>,
  record: TRecord,
  input: BuildCardListViewModelInput<TRecord>,
): CardListResolvedBadge {
  const raw = getValue(record, badge.field);

  return {
    value: createElement(
      FieldValue,
      buildFieldValueViewModel({
        presentation: {
          type: 'field-value',
          valueType: 'badge',
          tone: badge.tone,
        },
        value: raw,
      }),
    ),
    tone: badge.tone,
  };
}

function resolveField<TRecord extends CardRecord>(
  field: NonNullable<CardListPresentation['card']['fields']>[number],
  record: TRecord,
  input: BuildCardListViewModelInput<TRecord>,
): CardListResolvedField {
  const raw = getValue(record, field.field);

  return {
    key: field.key,
    label: field.label,
    valueType: field.valueType,
    empty: isEmptyValue(raw),
    value: createElement(
      FieldValue,
      buildFieldValueViewModel({
        presentation: {
          type: 'field-value',
          valueType: field.valueType ?? 'text',
          emptyLabel: field.emptyLabel,
          link: field.valueType === 'link' ? { target: 'internal' } : undefined,
        },
        value: raw,
        href:
          field.valueType === 'link'
            ? input.getFieldHref?.({
                record,
                field: field.field,
                value: raw,
              })
            : undefined,
      }),
    ),
  };
}

function resolveMetric<TRecord extends CardRecord>(
  metric: NonNullable<CardListPresentation['card']['metrics']>[number],
  record: TRecord,
): CardListResolvedMetric {
  const raw = getValue(record, metric.field);

  return {
    key: metric.key,
    label: metric.label,
    supportingText: metric.supportingText,
    value: createElement(
      FieldValue,
      buildFieldValueViewModel({
        presentation: {
          type: 'field-value',
          valueType: metric.valueType ?? 'text',
        },
        value: raw,
      }),
    ),
  };
}

function resolveAction<TRecord extends CardRecord>(
  action: NonNullable<CardListPresentation['card']['actions']>[number],
  record: TRecord,
  input: BuildCardListViewModelInput<TRecord>,
): CardListResolvedAction {
  const authorized = resolveAuthorization(action.actionKey, record, input);
  const hidden = action.hiddenWhenUnauthorized === true && authorized === false;

  const resolved: CardListResolvedAction = {
    key: action.key,
    label: action.label,
    icon: action.icon,
    intent: action.intent,
    disabled: action.disabled,
    hidden,
  };

  if (action.href) {
    resolved.href =
      input.getActionHref?.({
        record,
        href: action.href,
        actionKey: action.actionKey,
      }) ?? action.href;
  }

  if (action.actionKey) {
    const handler = input.actionHandlers?.[action.actionKey];
    resolved.onClick = handler ? () => handler(record) : undefined;
    resolved.disabled = action.disabled ?? typeof handler !== 'function';
  }

  return resolved;
}

function resolveAuthorization<TRecord extends CardRecord>(
  actionKey: string | undefined,
  record: TRecord,
  input: BuildCardListViewModelInput<TRecord>,
): boolean | undefined {
  if (!actionKey) return undefined;
  if (!input.isAuthorized) return undefined;

  return input.isAuthorized(actionKey, record);
}

function resolveRecordKey<TRecord extends CardRecord>(
  record: TRecord,
  index: number,
  getRecordKey?: (record: TRecord, index: number) => string,
): string {
  if (getRecordKey) {
    return getRecordKey(record, index);
  }

  const id = record.id;
  if (typeof id === 'string' && id.length > 0) return id;

  const key = record.key;
  if (typeof key === 'string' && key.length > 0) return key;

  return `card-${index}`;
}

function renderTextValue(value: unknown): ReactNode {
  if (isEmptyValue(value)) {
    return createElement('span', { className: 'text-sm text-gray-500 dark:text-gray-400' }, '—');
  }

  return createElement(
    'span',
    {
      className: 'block truncate text-sm text-gray-900 dark:text-gray-100',
      title: String(value),
    },
    String(value),
  );
}

function getValue(input: Record<string, unknown>, path: string): unknown {
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
