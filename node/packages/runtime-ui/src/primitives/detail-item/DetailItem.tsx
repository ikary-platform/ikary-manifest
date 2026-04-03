import { FieldValue } from '../field-value/FieldValue';
import type {
  DetailItemBadgeListViewProps,
  DetailItemFieldValueViewProps,
  DetailItemListSummaryViewProps,
  DetailItemReferenceViewProps,
  DetailItemViewProps,
} from './DetailItem.types';

export function DetailItem(props: DetailItemViewProps) {
  const valueNode = renderValue(props);

  return (
    <div
      data-testid={props.testId}
      data-detail-item-kind={props.kind}
      role="group"
      aria-labelledby={props.labelId}
      aria-busy={props.loading ? 'true' : undefined}
      className={containerClassName(props.dense)}
    >
      <div id={props.labelId} className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {props.label}
      </div>

      <div id={props.valueId} className="min-w-0" aria-live={props.loading || props.errorLabel ? 'polite' : undefined}>
        {valueNode}
      </div>
    </div>
  );
}

function renderValue(props: DetailItemViewProps) {
  if (props.loading) {
    return <LoadingValue dense={props.dense} />;
  }

  if (props.errorLabel) {
    return <ErrorValue label={props.errorLabel} dense={props.dense} />;
  }

  switch (props.kind) {
    case 'text':
    case 'date':
    case 'datetime':
    case 'boolean':
    case 'status':
    case 'link':
      return <FieldValue {...props.valueView} />;

    case 'long-text':
      return <LongTextValue valueView={props.valueView} />;

    case 'badge-list':
      return <BadgeListValue {...props} />;

    case 'user-reference':
    case 'entity-reference':
      return <ReferenceValue {...props} />;

    case 'list-summary':
      return <ListSummaryValue {...props} />;

    default:
      return assertNever(props);
  }
}

function BadgeListValue({ badges, overflowCount, emptyLabel, dense }: DetailItemBadgeListViewProps) {
  if (badges.length === 0) {
    return <EmptyValue label={emptyLabel} dense={dense} />;
  }

  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label="Values">
      {badges.map((badge) => (
        <li key={badge.key}>
          <FieldValue value={badge.label} valueType="badge" tone={badge.tone} dense={dense} />
        </li>
      ))}

      {overflowCount > 0 && (
        <li className="text-xs text-gray-500 dark:text-gray-400" aria-label={`${overflowCount} additional values`}>
          +{overflowCount} more
        </li>
      )}
    </ul>
  );
}

function ReferenceValue({ reference, emptyLabel, dense }: DetailItemReferenceViewProps) {
  if (!reference || reference.label.trim().length === 0) {
    return <EmptyValue label={emptyLabel} dense={dense} />;
  }

  return (
    <div className="space-y-0.5">
      {reference.href ? (
        <a href={reference.href} className={referenceLinkClassName(dense)} title={reference.label}>
          {reference.label}
        </a>
      ) : (
        <span className={referenceLabelClassName(dense)} title={reference.label}>
          {reference.label}
        </span>
      )}

      {reference.secondaryLabel && (
        <div className="text-xs text-gray-500 dark:text-gray-400">{reference.secondaryLabel}</div>
      )}
    </div>
  );
}

function ListSummaryValue({ items, overflowCount, emptyLabel, dense }: DetailItemListSummaryViewProps) {
  if (items.length === 0) {
    return <EmptyValue label={emptyLabel} dense={dense} />;
  }

  return (
    <div className="flex flex-wrap items-baseline gap-1">
      <span className={summaryClassName(dense)}>{items.join(', ')}</span>
      {overflowCount > 0 ? (
        <span className="text-xs text-gray-500 dark:text-gray-400">+{overflowCount} more</span>
      ) : null}
    </div>
  );
}

function EmptyValue({ label, dense }: { label: string; dense: boolean }) {
  return (
    <span className={['block text-gray-500 dark:text-gray-400', dense ? 'text-xs' : 'text-sm'].join(' ')}>{label}</span>
  );
}

function LongTextValue({ valueView }: { valueView: DetailItemFieldValueViewProps['valueView'] }) {
  return (
    <div className="max-w-full whitespace-pre-wrap break-words leading-6">
      <FieldValue {...valueView} />
    </div>
  );
}

function ErrorValue({ label, dense }: { label: string; dense: boolean }) {
  return (
    <span role="alert" className={['block text-red-700 dark:text-red-300', dense ? 'text-xs' : 'text-sm'].join(' ')}>
      {label}
    </span>
  );
}

function LoadingValue({ dense }: { dense: boolean }) {
  return (
    <div className="space-y-1">
      <span className="sr-only">Loading value</span>
      <span
        aria-hidden="true"
        className={['block h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800', dense ? 'h-3 w-28' : '']
          .filter(Boolean)
          .join(' ')}
      />
    </div>
  );
}

function containerClassName(dense: boolean): string {
  return ['grid grid-cols-1 gap-1', dense ? 'py-1.5' : 'py-2'].join(' ');
}

function referenceLinkClassName(dense: boolean): string {
  return [
    'inline-flex max-w-full rounded-sm text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:text-blue-400',
    dense ? 'text-xs' : 'text-sm',
  ].join(' ');
}

function referenceLabelClassName(dense: boolean): string {
  return ['block text-gray-900 dark:text-gray-100', dense ? 'text-xs' : 'text-sm'].join(' ');
}

function summaryClassName(dense: boolean): string {
  return ['block text-gray-900 dark:text-gray-100', dense ? 'text-xs' : 'text-sm'].join(' ');
}

function assertNever(value: never): never {
  throw new Error(`Unsupported detail item view kind: ${String(value)}`);
}
