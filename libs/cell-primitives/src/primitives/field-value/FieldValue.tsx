import type { FieldValueTone, FieldValueViewProps } from './FieldValue.types';

export function FieldValue({
  value,
  valueType,
  emptyLabel = '—',
  tone,
  href,
  onClick,
  linkTarget,
  truncate = false,
  tooltip = false,
  dense = false,
  currency,
  dateStyle = 'medium',
  datetimeStyle = 'medium',
  renderOverride,
}: FieldValueViewProps) {
  if (renderOverride !== undefined) {
    return <>{renderOverride}</>;
  }

  const empty = isEmptyValue(value);
  const textClass = [
    'block text-gray-900 dark:text-gray-100',
    dense ? 'text-xs' : 'text-sm',
    truncate ? 'truncate' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const displayTitle = tooltip && !empty ? String(value) : undefined;

  if (empty) {
    return (
      <span className={['block text-gray-500 dark:text-gray-400', dense ? 'text-xs' : 'text-sm'].join(' ')}>
        {emptyLabel}
      </span>
    );
  }

  switch (valueType) {
    case 'text':
      return (
        <span className={textClass} title={displayTitle}>
          {String(value)}
        </span>
      );

    case 'number':
      return (
        <span className={textClass} title={displayTitle}>
          {formatNumber(value)}
        </span>
      );

    case 'currency':
      return (
        <span className={textClass} title={displayTitle}>
          {formatCurrency(value, currency)}
        </span>
      );

    case 'date':
      return (
        <span className={textClass} title={displayTitle}>
          {formatDate(value, dateStyle)}
        </span>
      );

    case 'datetime':
      return (
        <span className={textClass} title={displayTitle}>
          {formatDateTime(value, datetimeStyle)}
        </span>
      );

    case 'boolean':
      return <span className={booleanClassName(dense)}>{value ? 'Yes' : 'No'}</span>;

    case 'badge':
    case 'status':
    case 'enum':
      return <span className={badgeClassName(tone ?? inferTone(value), dense)}>{String(value)}</span>;

    case 'link': {
      const label = String(value);

      if (href) {
        return (
          <a
            href={href}
            target={linkTarget === 'external' ? '_blank' : undefined}
            rel={linkTarget === 'external' ? 'noreferrer noopener' : undefined}
            className={linkClassName(dense, truncate)}
            title={tooltip ? label : undefined}
            onClick={(event) => {
              event.stopPropagation();
              onClick?.();
            }}
          >
            {label}
          </a>
        );
      }

      if (onClick) {
        return (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            className={linkButtonClassName(dense, truncate)}
            title={tooltip ? label : undefined}
          >
            {label}
          </button>
        );
      }

      return (
        <span className={textClass} title={displayTitle}>
          {label}
        </span>
      );
    }

    default:
      return (
        <span className={textClass} title={displayTitle}>
          {String(value)}
        </span>
      );
  }
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function formatNumber(value: unknown): string {
  const asNumber = Number(value);
  if (Number.isNaN(asNumber)) return String(value);
  return new Intl.NumberFormat().format(asNumber);
}

function formatCurrency(value: unknown, currency = 'USD'): string {
  const asNumber = Number(value);
  if (Number.isNaN(asNumber)) return String(value);

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(asNumber);
}

function formatDate(value: unknown, style: 'short' | 'medium' | 'long'): string {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: style,
  }).format(date);
}

function formatDateTime(value: unknown, style: 'short' | 'medium' | 'long'): string {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: style,
    timeStyle: style === 'long' ? 'medium' : 'short',
  }).format(date);
}

function booleanClassName(dense: boolean): string {
  return [
    'inline-flex items-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    dense ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px]',
    'font-semibold uppercase tracking-wide',
  ].join(' ');
}

function badgeClassName(tone: FieldValueTone | undefined, dense: boolean): string {
  return [
    'inline-flex items-center rounded-full font-semibold uppercase tracking-wide',
    dense ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px]',
    badgeToneClass(tone),
  ].join(' ');
}

function badgeToneClass(tone: FieldValueTone | undefined): string {
  switch (tone) {
    case 'info':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
    case 'success':
      return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300';
    case 'danger':
      return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300';
    case 'neutral':
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
}

function inferTone(value: unknown): FieldValueTone {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  const toneMap: Record<string, FieldValueTone> = {
    active: 'success',
    success: 'success',
    approved: 'success',
    enabled: 'success',

    pending: 'warning',
    warning: 'warning',
    draft: 'warning',

    inactive: 'neutral',
    archived: 'neutral',

    failed: 'danger',
    error: 'danger',
    rejected: 'danger',
    blocked: 'danger',
  };

  return toneMap[normalized] ?? 'neutral';
}

function linkClassName(dense: boolean, truncate: boolean): string {
  return [
    'rounded-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    dense ? 'text-xs' : 'text-sm',
    truncate ? 'block truncate' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function linkButtonClassName(dense: boolean, truncate: boolean): string {
  return [
    'rounded-sm text-left text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    dense ? 'text-xs' : 'text-sm',
    truncate ? 'block truncate' : '',
  ]
    .filter(Boolean)
    .join(' ');
}
