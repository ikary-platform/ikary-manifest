import { RenderStateBoundary } from '../../runtime/RenderStateBoundary';
import type { RenderState } from '../../runtime/render-state.types';
import type {
  DetailSectionMetaTone,
  DetailSectionResolvedAction,
  DetailSectionResolvedCallout,
  DetailSectionResolvedFieldItem,
  DetailSectionResolvedMetricItem,
  DetailSectionViewContent,
  DetailSectionViewProps,
} from './DetailSection.types';

export function DetailSection({
  title,
  description,
  actions = [],
  content,
  emphasis = 'default',
  dense = false,
}: DetailSectionViewProps) {
  const visibleActions = actions.filter((action) => !action.hidden);
  const paddingClass = dense ? 'p-4' : 'p-5';
  const gapClass = dense ? 'gap-3' : 'gap-4';

  return (
    <section className={sectionClassName(emphasis)}>
      <div className={`${paddingClass} space-y-4`}>
        <div className={`flex flex-col justify-between ${gapClass} lg:flex-row lg:items-start`}>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>

            {description && <p className="max-w-3xl text-sm text-gray-600 dark:text-gray-400">{description}</p>}
          </div>

          {visibleActions.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {visibleActions.map((action) => (
                <ActionButton key={action.key} action={action} />
              ))}
            </div>
          )}
        </div>

        <div>{renderContent(content, dense)}</div>
      </div>
    </section>
  );
}

function renderContent(content: DetailSectionViewProps['content'], dense: boolean) {
  const renderState = resolveDetailSectionRenderState(content, dense);
  const node = renderDetailSectionContent(content, dense);

  return <RenderStateBoundary state={renderState}>{node}</RenderStateBoundary>;
}

function renderDetailSectionContent(content: DetailSectionViewProps['content'], dense: boolean) {
  switch (content.mode) {
    case 'field-list':
      return (
        <div className="space-y-3">
          {content.items.map((item) => (
            <FieldRow key={item.key} item={item} dense={dense} />
          ))}
        </div>
      );

    case 'field-grid':
      return (
        <div
          className={
            content.columns === 3
              ? 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
              : 'grid grid-cols-1 gap-3 lg:grid-cols-2'
          }
        >
          {content.items.map((item) => (
            <FieldCard key={item.key} item={item} dense={dense} />
          ))}
        </div>
      );

    case 'metric-list':
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {content.items.map((item) => (
            <MetricCard key={item.key} item={item} dense={dense} />
          ))}
        </div>
      );

    case 'callout':
      return <CalloutView callout={content.callout} />;

    case 'custom-block':
      return <div>{content.content}</div>;

    default:
      return null;
  }
}

function resolveDetailSectionRenderState(content: DetailSectionViewContent, dense: boolean): RenderState | undefined {
  if (content.mode === 'field-list' && content.items.length === 0) {
    return toDetailSectionEmptyState(content.emptyState, dense);
  }

  if (content.mode === 'field-grid' && content.items.length === 0) {
    return toDetailSectionEmptyState(content.emptyState, dense);
  }

  if (content.mode === 'metric-list' && content.items.length === 0) {
    return toDetailSectionEmptyState(content.emptyState, dense);
  }

  if (content.mode === 'custom-block' && !content.content) {
    return toDetailSectionEmptyState(content.emptyState, dense);
  }

  return undefined;
}

function toDetailSectionEmptyState(
  emptyState: { title: string; description?: string } | undefined,
  dense: boolean,
): RenderState {
  return {
    kind: 'empty',
    state: {
      title: emptyState?.title ?? 'No information available',
      description: emptyState?.description,
      variant: 'section',
      density: dense ? 'compact' : 'comfortable',
    },
  };
}

function FieldRow({ item, dense }: { item: DetailSectionResolvedFieldItem; dense: boolean }) {
  const spacingClass = dense ? 'gap-2 py-2' : 'gap-3 py-2.5';

  return (
    <div
      className={`grid grid-cols-1 border-b border-gray-100 ${spacingClass} dark:border-gray-800 md:grid-cols-[180px_minmax(0,1fr)]`}
    >
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        <LabelWithMeta label={item.label} tooltip={item.tooltip} icon={item.icon} />
      </div>
      <div className={item.empty ? 'text-sm text-gray-500 dark:text-gray-400' : ''}>{item.value}</div>
    </div>
  );
}

function FieldCard({ item, dense }: { item: DetailSectionResolvedFieldItem; dense: boolean }) {
  const paddingClass = dense ? 'p-3' : 'p-4';

  return (
    <div className={`rounded-md border border-gray-200 bg-white ${paddingClass} dark:border-gray-800 dark:bg-gray-950`}>
      <div className="space-y-1.5">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          <LabelWithMeta label={item.label} tooltip={item.tooltip} icon={item.icon} />
        </div>
        <div className={item.empty ? 'text-sm text-gray-500 dark:text-gray-400' : ''}>{item.value}</div>
      </div>
    </div>
  );
}

function MetricCard({ item, dense }: { item: DetailSectionResolvedMetricItem; dense: boolean }) {
  const paddingClass = dense ? 'p-3' : 'p-4';

  return (
    <div className={`rounded-md border border-gray-200 bg-white ${paddingClass} dark:border-gray-800 dark:bg-gray-950`}>
      <div className="space-y-1">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.label}</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.value}</div>
        {item.supportingText && <div className="text-xs text-gray-500 dark:text-gray-400">{item.supportingText}</div>}
      </div>
    </div>
  );
}

function CalloutView({ callout }: { callout: DetailSectionResolvedCallout }) {
  return (
    <div className={`rounded-md border p-4 ${calloutToneClass(callout.tone)}`}>
      <div className="space-y-1">
        <div className="text-sm font-semibold">{callout.title}</div>
        {callout.description && <div className="text-sm opacity-90">{callout.description}</div>}
      </div>
    </div>
  );
}

function ActionButton({ action }: { action: DetailSectionResolvedAction }) {
  const className = resolveActionClassName(action);

  if (action.href) {
    return (
      <a
        href={action.href}
        aria-disabled={action.disabled ? 'true' : undefined}
        onClick={(event) => {
          if (action.disabled) {
            event.preventDefault();
          }
        }}
        className={className}
      >
        {action.label}
      </a>
    );
  }

  return (
    <button type="button" onClick={action.onClick} disabled={action.disabled} className={className}>
      {action.label}
    </button>
  );
}

function LabelWithMeta({ label, tooltip, icon }: { label: string; tooltip?: string; icon?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon && (
        <span aria-hidden="true" className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {icon}
        </span>
      )}
      <span title={tooltip}>{label}</span>
    </span>
  );
}

function sectionClassName(emphasis: DetailSectionViewProps['emphasis']): string {
  switch (emphasis) {
    case 'subtle':
      return 'rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/70';
    case 'strong':
      return 'rounded-lg border border-gray-300 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-950';
    case 'default':
    default:
      return 'rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950';
  }
}

function resolveActionClassName(action: DetailSectionResolvedAction): string {
  const base =
    'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50';

  if (action.intent === 'danger') {
    return `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/40`;
  }

  return `${base} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900`;
}

function calloutToneClass(tone: DetailSectionMetaTone): string {
  switch (tone) {
    case 'info':
      return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200';
    case 'success':
      return 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200';
    case 'danger':
      return 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200';
    case 'neutral':
    default:
      return 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}
