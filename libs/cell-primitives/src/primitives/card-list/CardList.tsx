import { Link } from 'react-router-dom';
import { RenderStateBoundary } from '../../runtime/RenderStateBoundary';
import type { RenderState } from '../../runtime/render-state.types';
import type {
  CardListResolvedAction,
  CardListResolvedBadge,
  CardListResolvedCard,
  CardListResolvedEmptyState,
  CardListResolvedField,
  CardListResolvedMetric,
  CardListViewProps,
} from './CardList.types';

export function CardList<TRecord = Record<string, unknown>>({
  items = [] as CardListResolvedCard<TRecord>[],
  columns = '3',
  emptyState,
  dense = false,
  loading = false,
}: CardListViewProps<TRecord>) {
  const visibleItems = items;
  const paddingClass = dense ? 'p-3' : 'p-4';
  const gapClass = dense ? 'gap-3' : 'gap-4';
  const renderState = resolveCardListRenderState({
    loading,
    items: visibleItems,
    emptyState,
    dense,
    columns,
  });

  return (
    <RenderStateBoundary state={renderState}>
      <div className={gridClassName(columns, gapClass)}>
        {visibleItems.map((item) => (
          <CardView key={item.key} item={item} dense={dense} paddingClass={paddingClass} />
        ))}
      </div>
    </RenderStateBoundary>
  );
}

function resolveCardListRenderState<TRecord>(input: {
  loading: boolean;
  items: CardListResolvedCard<TRecord>[];
  emptyState?: CardListResolvedEmptyState;
  dense: boolean;
  columns: '1' | '2' | '3';
}): RenderState | undefined {
  if (input.loading) {
    return {
      kind: 'loading',
      state: {
        variant: 'section',
        density: input.dense ? 'compact' : 'comfortable',
        mode: 'skeleton',
        label: 'Loading items',
        skeleton: {
          lines: 3,
          blocks: loadingBlockCount(input.columns),
          avatar: false,
        },
      },
    };
  }

  if (input.items.length === 0) {
    return {
      kind: 'empty',
      state: {
        title: input.emptyState?.title ?? 'No items found',
        description: input.emptyState?.description,
        variant: 'section',
        density: input.dense ? 'compact' : 'comfortable',
      },
    };
  }

  return undefined;
}

function CardView<TRecord>({
  item,
  dense,
  paddingClass,
}: {
  item: CardListResolvedCard<TRecord>;
  dense: boolean;
  paddingClass: string;
}) {
  const visibleActions = (item.actions ?? []).filter((action) => !action.hidden);
  const hasFooter = visibleActions.length > 0;
  const hasBody = Boolean(item.fields?.length) || Boolean(item.metrics?.length);

  return (
    <article className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className={`${paddingClass} space-y-4`}>
        <header className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="min-w-0 text-base font-semibold text-gray-900 dark:text-gray-100">{item.title}</div>

              {item.subtitle && <div className="min-w-0 text-sm text-gray-600 dark:text-gray-400">{item.subtitle}</div>}
            </div>

            {item.badge && <BadgeView badge={item.badge} />}
          </div>
        </header>

        {hasBody && (
          <div className="space-y-4">
            {item.fields && item.fields.length > 0 && (
              <div className="space-y-2">
                {item.fields.map((field) => (
                  <FieldRow key={field.key} field={field} dense={dense} />
                ))}
              </div>
            )}

            {item.metrics && item.metrics.length > 0 && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {item.metrics.map((metric) => (
                  <MetricCard key={metric.key} metric={metric} dense={dense} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {hasFooter && (
        <footer className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-2">
            {visibleActions.map((action) => (
              <ActionButton key={action.key} action={action} />
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}

function BadgeView({ badge }: { badge: CardListResolvedBadge }) {
  return <div className="shrink-0">{badge.value}</div>;
}

function FieldRow({ field, dense }: { field: CardListResolvedField; dense: boolean }) {
  return (
    <div
      className={['grid grid-cols-[110px_minmax(0,1fr)] items-start gap-3', dense ? 'text-xs' : 'text-sm'].join(' ')}
    >
      <div className="font-medium text-gray-500 dark:text-gray-400">{field.label}</div>
      <div className={field.empty ? 'text-gray-500 dark:text-gray-400' : ''}>{field.value}</div>
    </div>
  );
}

function MetricCard({ metric, dense }: { metric: CardListResolvedMetric; dense: boolean }) {
  return (
    <div
      className={[
        'rounded-md border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/70',
        dense ? 'p-2.5' : 'p-3',
      ].join(' ')}
    >
      <div className="space-y-1">
        <div
          className={[
            'font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400',
            dense ? 'text-[10px]' : 'text-xs',
          ].join(' ')}
        >
          {metric.label}
        </div>
        <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{metric.value}</div>
        {metric.supportingText && (
          <div className={['text-gray-500 dark:text-gray-400', dense ? 'text-[10px]' : 'text-xs'].join(' ')}>
            {metric.supportingText}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ action }: { action: CardListResolvedAction }) {
  const className = resolveActionClassName(action);

  if (action.href) {
    return (
      <Link
        to={action.href}
        aria-disabled={action.disabled ? 'true' : undefined}
        onClick={(event) => {
          if (action.disabled) {
            event.preventDefault();
          }
        }}
        className={className}
      >
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} disabled={action.disabled} className={className}>
      {action.label}
    </button>
  );
}

function gridClassName(columns: '1' | '2' | '3', gapClass: string): string {
  if (columns === '1') {
    return `grid grid-cols-1 ${gapClass}`;
  }

  if (columns === '2') {
    return `grid grid-cols-1 md:grid-cols-2 ${gapClass}`;
  }

  return `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${gapClass}`;
}

function loadingBlockCount(columns: '1' | '2' | '3'): number {
  if (columns === '1') return 1;
  if (columns === '2') return 2;
  return 3;
}

function resolveActionClassName(action: CardListResolvedAction): string {
  const base =
    'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50';

  if (action.intent === 'danger') {
    return `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/40`;
  }

  return `${base} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900`;
}
