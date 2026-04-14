import { RenderStateBoundary } from '../../runtime/RenderStateBoundary';
import type { ActivityFeedViewProps } from './ActivityFeed.types';

export function ActivityFeed({
  variant = 'default',
  density = 'comfortable',
  title,
  subtitle,
  items = [],
  action,
  renderState,
}: ActivityFeedViewProps) {
  const hasHeader = Boolean(title || subtitle || action);
  const body = (
    <div
      data-activity-feed-variant={variant}
      data-activity-feed-density={density}
      className={containerClassName(variant)}
    >
      {hasHeader ? (
        <header
          className={[
            'flex flex-wrap items-start justify-between gap-3 border-b border-gray-100',
            density === 'compact' ? 'px-3 py-2.5' : 'px-4 py-3',
            'dark:border-gray-800',
          ].join(' ')}
        >
          <div className="min-w-0 flex-1 space-y-0.5">
            {title ? <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3> : null}
            {subtitle ? <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p> : null}
          </div>

          {action ? <FeedActionButton action={action} /> : null}
        </header>
      ) : null}

      <div className={density === 'compact' ? 'p-3' : 'p-4'}>
        <RenderStateBoundary state={renderState}>
          {items.length > 0 ? (
            <ol className={listClassName(density)}>
              {items.map((item, index) => (
                <ActivityFeedItemRow
                  key={item.key}
                  item={item}
                  density={density}
                  variant={variant}
                  isLast={index === items.length - 1}
                />
              ))}
            </ol>
          ) : (
            <div className="rounded-md border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              No recent activity
            </div>
          )}
        </RenderStateBoundary>
      </div>
    </div>
  );

  return <section aria-label={title ?? 'Activity feed'}>{body}</section>;
}

function ActivityFeedItemRow({
  item,
  density,
  variant,
  isLast,
}: {
  item: ActivityFeedViewProps['items'][number];
  density: ActivityFeedViewProps['density'];
  variant: ActivityFeedViewProps['variant'];
  isLast: boolean;
}) {
  const metadata = [item.actor, item.timestamp, item.targetLabel].filter((value): value is string => Boolean(value));

  const isTimeline = variant === 'timeline';

  return (
    <li className={isTimeline ? 'relative pl-7' : 'flex gap-3'}>
      {isTimeline ? (
        <>
          {!isLast ? (
            <span
              aria-hidden="true"
              className="absolute bottom-[-10px] left-2.5 top-5 w-px bg-gray-200 dark:bg-gray-800"
            />
          ) : null}
          <span
            aria-hidden="true"
            className={[
              'absolute left-0.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border text-[8px] font-semibold uppercase',
              toneBadgeClassName(item.tone),
            ].join(' ')}
          >
            {item.icon ?? toneGlyph(item.tone)}
          </span>
        </>
      ) : (
        <span
          aria-hidden="true"
          className={[
            'mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[8px] font-semibold uppercase',
            toneBadgeClassName(item.tone),
          ].join(' ')}
        >
          {item.icon ?? toneGlyph(item.tone)}
        </span>
      )}

      <div className="min-w-0 flex-1 space-y-1">
        <ItemSummary item={item} density={density} />

        {metadata.length > 0 || item.tone !== 'default' ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {item.tone !== 'default' ? (
              <span
                className={[
                  'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                  toneTagClassName(item.tone),
                ].join(' ')}
              >
                {toneLabel(item.tone)}
              </span>
            ) : null}

            {metadata.length > 0 ? (
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                {metadata.map((value, index) => (
                  <span key={`${item.key}-meta-${index}`} className="inline-flex items-center gap-1.5">
                    {index > 0 ? (
                      <span aria-hidden="true" className="text-gray-300 dark:text-gray-600">
                        •
                      </span>
                    ) : null}
                    <span>{value}</span>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}

function ItemSummary({
  item,
  density,
}: {
  item: ActivityFeedViewProps['items'][number];
  density: ActivityFeedViewProps['density'];
}) {
  const className = [
    density === 'compact' ? 'text-xs' : 'text-sm',
    'font-medium leading-relaxed text-gray-800 dark:text-gray-200',
  ].join(' ');

  if (item.href) {
    return (
      <a
        href={item.href}
        aria-disabled={item.disabled ? 'true' : undefined}
        onClick={(event) => {
          if (item.disabled) {
            event.preventDefault();
            return;
          }

          item.onClick?.();
        }}
        className={[
          className,
          'transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:underline dark:hover:text-gray-50',
          item.disabled ? 'pointer-events-none opacity-50' : '',
        ].join(' ')}
      >
        {item.summary}
      </a>
    );
  }

  if (item.onClick || item.disabled) {
    return (
      <button
        type="button"
        disabled={item.disabled}
        onClick={item.onClick}
        className={[
          className,
          'text-left transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:underline dark:hover:text-gray-50',
          'disabled:cursor-not-allowed disabled:opacity-50',
        ].join(' ')}
      >
        {item.summary}
      </button>
    );
  }

  return <p className={className}>{item.summary}</p>;
}

function FeedActionButton({ action }: { action: NonNullable<ActivityFeedViewProps['action']> }) {
  const className = [
    'inline-flex h-7 items-center justify-center rounded-md border border-gray-200 px-2.5 text-xs font-medium',
    'bg-white text-gray-700 transition-colors hover:bg-gray-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900',
  ].join(' ');

  if (action.href) {
    return (
      <a
        href={action.href}
        aria-disabled={action.disabled ? 'true' : undefined}
        onClick={(event) => {
          if (action.disabled) {
            event.preventDefault();
            return;
          }

          action.onClick?.();
        }}
        className={[className, action.disabled ? 'pointer-events-none' : ''].join(' ')}
      >
        {action.label}
      </a>
    );
  }

  return (
    <button type="button" disabled={action.disabled} onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

function containerClassName(variant: ActivityFeedViewProps['variant']): string {
  if (variant === 'compact') {
    return 'rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950';
  }

  if (variant === 'timeline') {
    return 'rounded-lg border border-gray-200 bg-white/95 dark:border-gray-800 dark:bg-gray-950';
  }

  return 'rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950';
}

function listClassName(density: ActivityFeedViewProps['density']): string {
  return density === 'compact' ? 'space-y-2.5' : 'space-y-3';
}

function toneGlyph(tone: ActivityFeedViewProps['items'][number]['tone']): string {
  switch (tone) {
    case 'info':
      return 'i';
    case 'success':
      return '+';
    case 'warning':
      return '!';
    case 'danger':
      return '×';
    case 'default':
    default:
      return '•';
  }
}

function toneLabel(tone: ActivityFeedViewProps['items'][number]['tone']): string {
  switch (tone) {
    case 'info':
      return 'Info';
    case 'success':
      return 'Success';
    case 'warning':
      return 'Warning';
    case 'danger':
      return 'Alert';
    case 'default':
    default:
      return 'Update';
  }
}

function toneBadgeClassName(tone: ActivityFeedViewProps['items'][number]['tone']): string {
  switch (tone) {
    case 'info':
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300';
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    case 'danger':
      return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300';
    case 'default':
    default:
      return 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300';
  }
}

function toneTagClassName(tone: ActivityFeedViewProps['items'][number]['tone']): string {
  switch (tone) {
    case 'info':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
    case 'success':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'warning':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    case 'danger':
      return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300';
    case 'default':
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
}
