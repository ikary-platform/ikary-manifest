import { createElement } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import type { DataGridPresentation, FieldValuePresentation } from '@ikary/presentation';
import { buildFieldValueViewModel } from '../field-value/FieldValue.adapter';
import { FieldValue } from '../field-value/FieldValue';

type PresentationColumn = DataGridPresentation['columns'][number];

export type DataGridFormatters = {
  number?: (value: unknown) => string;
  currency?: (value: unknown, currency?: string) => string;
  date?: (value: unknown, style?: 'short' | 'medium' | 'long') => string;
  datetime?: (value: unknown, style?: 'short' | 'medium' | 'long') => string;
};

export function renderDataGridFieldValueCell<T>(input: {
  column: PresentationColumn;
  row: T;
  value: unknown;
  href?: string;
  onOpen?: (row: T) => void;
  dense?: boolean;
}): ReactNode {
  const presentation = toFieldValuePresentation(input.column, input.dense ?? false);

  const onClick =
    input.column.type === 'link' && !input.href && input.onOpen ? () => input.onOpen?.(input.row) : undefined;

  return createElement(
    FieldValue,
    buildFieldValueViewModel({
      presentation,
      value: input.value,
      href: input.href,
      onClick,
    }),
  );
}

export function renderActionsCell<T>(input: {
  row: T;
  actions: Array<{
    key: string;
    label: string;
    intent?: 'default' | 'neutral' | 'danger';
    requiresConfirmation?: boolean;
    onClick?: (row: T) => void;
  }>;
}): ReactNode {
  if (input.actions.length === 0) {
    return createElement(
      FieldValue,
      buildFieldValueViewModel({
        presentation: {
          type: 'field-value',
          valueType: 'text',
        },
        value: '',
      }),
    );
  }

  return createElement(
    'div',
    { className: 'flex justify-end gap-1.5' },
    ...input.actions.map((action) => {
      const disabled = typeof action.onClick !== 'function';

      return createElement(
        'button',
        {
          key: action.key,
          type: 'button',
          disabled,
          className: resolveActionButtonClass(action.intent, disabled),
          onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();

            if (!action.onClick) return;

            if (action.requiresConfirmation && typeof window !== 'undefined') {
              const confirmed = window.confirm(`Are you sure you want to ${action.label.toLowerCase()}?`);
              if (!confirmed) return;
            }

            action.onClick(input.row);
          },
        },
        action.label,
      );
    }),
  );
}

export function buildEmptyState(emptyState?: { title: string; description?: string }): ReactNode | undefined {
  if (!emptyState) return undefined;

  return createElement(
    'div',
    { className: 'space-y-1' },
    createElement('div', { className: 'font-medium text-gray-700 dark:text-gray-200' }, emptyState.title),
    emptyState.description
      ? createElement('div', { className: 'text-sm text-gray-500 dark:text-gray-400' }, emptyState.description)
      : null,
  );
}

export function defaultAlign(column: PresentationColumn): 'start' | 'center' | 'end' {
  if (column.type === 'number' || column.type === 'currency' || column.type === 'actions') {
    return 'end';
  }

  if (column.type === 'boolean') {
    return 'center';
  }

  return 'start';
}

export function getValue(input: unknown, path: string): unknown {
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

function toFieldValuePresentation(column: PresentationColumn, dense: boolean): FieldValuePresentation {
  const valueType = mapColumnType(column.type);
  const truncate = column.truncate ?? false;

  const presentation: FieldValuePresentation = {
    type: 'field-value',
    valueType,
    truncate,
    tooltip: resolveTooltip(column.tooltip, truncate),
    dense,
  };

  if (valueType === 'link') {
    presentation.link = {
      target: 'internal',
    };
  }

  if (valueType === 'currency' && column.format?.currency) {
    presentation.format = {
      ...(presentation.format ?? {}),
      currency: column.format.currency,
    };
  }

  if (valueType === 'date' && column.format?.dateStyle) {
    presentation.format = {
      ...(presentation.format ?? {}),
      dateStyle: column.format.dateStyle,
    };
  }

  if (valueType === 'datetime' && column.format?.datetimeStyle) {
    presentation.format = {
      ...(presentation.format ?? {}),
      datetimeStyle: column.format.datetimeStyle,
    };
  }

  return presentation;
}

function mapColumnType(type: PresentationColumn['type']): FieldValuePresentation['valueType'] {
  switch (type) {
    case 'text':
    case 'number':
    case 'currency':
    case 'date':
    case 'datetime':
    case 'boolean':
    case 'badge':
    case 'status':
    case 'enum':
    case 'link':
      return type;
    case 'custom':
    case 'actions':
    default:
      return 'text';
  }
}

function resolveTooltip(tooltip: PresentationColumn['tooltip'], truncate: boolean): boolean {
  if (tooltip === 'always') return true;
  if (tooltip === 'when-truncated') return truncate;
  return false;
}

function resolveActionButtonClass(intent: 'default' | 'neutral' | 'danger' | undefined, disabled: boolean): string {
  const base = 'rounded border px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40';

  if (disabled) {
    return `${base} border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500`;
  }

  if (intent === 'danger') {
    return `${base} border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40`;
  }

  return `${base} border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800`;
}
