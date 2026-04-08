import { isValidElement, type ReactNode } from 'react';
import { PrimitiveRenderer } from '../../runtime/PrimitiveRenderer';
import { RenderStateBoundary } from '../../runtime/RenderStateBoundary';
import { EmptyState } from '../empty-state/EmptyState';
import { ActivityFeed } from '../activity-feed/ActivityFeed';
import type { ActivityFeedViewProps } from '../activity-feed/ActivityFeed.types';
import { MetricCard } from '../metric-card/MetricCard';
import { PageHeader } from '../page-header';
import type { PageHeaderResolvedAction } from '../page-header/PageHeader.types';
import type {
  DashboardPageResolvedAction,
  DashboardPageViewProps,
  DashboardWidgetContent,
  DashboardWidgetPrimitiveNode,
  DashboardWidgetResolvedAction,
  DashboardWidgetView,
} from './DashboardPage.types';

type DashboardWidgetBodyResolution = {
  node: ReactNode;
  handlesRenderState: boolean;
};

export function DashboardPage({
  variant,
  density,
  title,
  subtitle,
  actions = [],
  kpis = [],
  primaryWidgets = [],
  secondaryWidgets = [],
  renderState,
}: DashboardPageViewProps) {
  const { primaryAction, secondaryActions } = resolveHeaderActions(actions);
  const pageRenderState = renderState ?? deriveDashboardPageRenderState({ kpis, primaryWidgets, secondaryWidgets });

  const shell = (
    <article data-dashboard-page-variant={variant} data-dashboard-page-density={density} className="space-y-4 pb-4">
      <PageHeader
        title={title}
        description={subtitle}
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
      />

      <div className="space-y-4 px-4 sm:px-6">
        {kpis.length > 0 ? <KpiStrip density={density} widgets={kpis} /> : null}

        {primaryWidgets.length > 0 ? (
          <WidgetZone
            title="Primary widgets"
            density={density}
            gridClassName="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3"
            widgets={primaryWidgets}
          />
        ) : null}

        {secondaryWidgets.length > 0 ? (
          <WidgetZone
            title="Secondary widgets"
            density={density}
            gridClassName="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
            widgets={secondaryWidgets}
          />
        ) : null}
      </div>
    </article>
  );

  return <RenderStateBoundary state={pageRenderState}>{shell}</RenderStateBoundary>;
}

function KpiStrip({
  density,
  widgets,
}: {
  density: DashboardPageViewProps['density'];
  widgets: DashboardWidgetView[];
}) {
  return (
    <section aria-label="Key metrics" className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
        Key metrics
      </h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {widgets.map((widget) => (
          <KpiCard key={widget.key} widget={widget} density={density} />
        ))}
      </div>
    </section>
  );
}

function KpiCard({ widget, density }: { widget: DashboardWidgetView; density: DashboardPageViewProps['density'] }) {
  const primitiveNode = toPrimitiveNode(widget.content);
  if (primitiveNode) {
    return (
      <PrimitiveRenderer
        primitive={primitiveNode.primitive}
        props={primitiveNode.props}
        runtime={primitiveNode.runtime}
      />
    );
  }

  const metricContent = toRecord(widget.content);
  const defaultAction = widget.actions[0];
  const contentAction = resolveMetricAction(toRecord(metricContent?.action));

  return (
    <MetricCard
      variant={widget.size === 'large' ? 'emphasis' : widget.size === 'small' ? 'compact' : 'default'}
      density={density}
      label={widget.title}
      value={resolveMetricValue(widget.content)}
      subtitle={asNonEmptyString(metricContent?.subtitle) ?? widget.subtitle}
      delta={asNonEmptyString(metricContent?.delta)}
      deltaDirection={asMetricDeltaDirection(metricContent?.deltaDirection)}
      tone={asMetricTone(metricContent?.tone) ?? 'default'}
      icon={asNonEmptyString(metricContent?.icon)}
      action={contentAction ?? resolveMetricActionFromWidget(defaultAction)}
      renderState={widget.renderState}
    />
  );
}

function WidgetZone({
  title,
  density,
  gridClassName,
  widgets,
}: {
  title: string;
  density: DashboardPageViewProps['density'];
  gridClassName: string;
  widgets: DashboardWidgetView[];
}) {
  return (
    <section aria-label={title} className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">{title}</h2>

      <div className={gridClassName}>
        {widgets.map((widget) => (
          <DashboardWidgetCard key={widget.key} widget={widget} density={density} />
        ))}
      </div>
    </section>
  );
}

function DashboardWidgetCard({
  widget,
  density,
}: {
  widget: DashboardWidgetView;
  density: DashboardPageViewProps['density'];
}) {
  const bodyPadding = density === 'compact' ? 'p-3' : 'p-4';
  const bodyResolution = resolveWidgetBody(widget, density);
  const widgetBody = bodyResolution.handlesRenderState ? (
    bodyResolution.node
  ) : (
    <RenderStateBoundary state={widget.renderState}>{bodyResolution.node}</RenderStateBoundary>
  );

  return (
    <section
      data-dashboard-widget-key={widget.key}
      data-dashboard-widget-size={widget.size}
      className={[
        'rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
        widgetSizeClassName(widget.size),
      ].join(' ')}
    >
      <header
        className={[
          'flex flex-wrap items-start justify-between gap-2 border-b border-gray-100',
          'dark:border-gray-800',
          density === 'compact' ? 'px-3 py-2.5' : 'px-4 py-3',
        ].join(' ')}
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{widget.title}</h3>
          {widget.subtitle ? <p className="text-xs text-gray-500 dark:text-gray-400">{widget.subtitle}</p> : null}
        </div>

        {widget.actions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {widget.actions.map((action) => (
              <WidgetActionButton key={action.key} action={action} />
            ))}
          </div>
        ) : null}
      </header>

      <div className={bodyPadding}>{widgetBody}</div>
    </section>
  );
}

function resolveWidgetBody(
  widget: DashboardWidgetView,
  density: DashboardPageViewProps['density'],
): DashboardWidgetBodyResolution {
  const primitiveNode = toPrimitiveNode(widget.content);
  if (primitiveNode) {
    return {
      handlesRenderState: false,
      node: (
        <PrimitiveRenderer
          primitive={primitiveNode.primitive}
          props={primitiveNode.props}
          runtime={primitiveNode.runtime}
        />
      ),
    };
  }

  if (widget.rendererKey === 'activity-feed') {
    const feedProps = toActivityFeedProps(widget, density);
    return {
      handlesRenderState: true,
      node: <ActivityFeed {...feedProps} renderState={widget.renderState} />,
    };
  }

  if (widget.rendererKey === 'metric-card') {
    const metricContent = toRecord(widget.content);
    return {
      handlesRenderState: true,
      node: (
        <MetricCard
          variant={widget.size === 'large' ? 'emphasis' : widget.size === 'small' ? 'compact' : 'default'}
          density={density}
          label={widget.title}
          value={resolveMetricValue(widget.content)}
          subtitle={asNonEmptyString(metricContent?.subtitle) ?? widget.subtitle}
          delta={asNonEmptyString(metricContent?.delta)}
          deltaDirection={asMetricDeltaDirection(metricContent?.deltaDirection)}
          tone={asMetricTone(metricContent?.tone) ?? 'default'}
          icon={asNonEmptyString(metricContent?.icon)}
          action={resolveMetricActionFromWidget(widget.actions[0])}
          renderState={widget.renderState}
        />
      ),
    };
  }

  if (isValidElement(widget.content)) {
    return {
      handlesRenderState: false,
      node: widget.content,
    };
  }

  if (typeof widget.content === 'string' || typeof widget.content === 'number') {
    return {
      handlesRenderState: false,
      node: <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{widget.content}</p>,
    };
  }

  return {
    handlesRenderState: false,
    node: <WidgetRendererPlaceholder rendererKey={widget.rendererKey} />,
  };
}

function toActivityFeedProps(widget: DashboardWidgetView, density: DashboardPageViewProps['density']) {
  const content = toRecord(widget.content);
  const itemsInput = Array.isArray(content?.items) ? content.items : [];
  const items: ActivityFeedViewProps['items'] = [];

  itemsInput.forEach((item, index) => {
    const record = toRecord(item);
    if (!record) {
      return;
    }

    const summary = asNonEmptyString(record.summary);
    if (!summary) {
      return;
    }

    const resolvedItem: ActivityFeedViewProps['items'][number] = {
      key: asNonEmptyString(record.key) ?? `${widget.key}-item-${index + 1}`,
      summary,
      tone: asActivityTone(record.tone) ?? 'default',
      disabled: record.disabled === true,
    };

    const actor = asNonEmptyString(record.actor);
    const timestamp = asNonEmptyString(record.timestamp);
    const targetLabel = asNonEmptyString(record.targetLabel);
    const icon = asNonEmptyString(record.icon);
    const href = asNonEmptyString(record.href);

    if (actor) resolvedItem.actor = actor;
    if (timestamp) resolvedItem.timestamp = timestamp;
    if (targetLabel) resolvedItem.targetLabel = targetLabel;
    if (icon) resolvedItem.icon = icon;
    if (href) resolvedItem.href = href;

    items.push(resolvedItem);
  });

  return {
    variant: asActivityVariant(content?.variant) ?? 'default',
    density: asActivityDensity(content?.density) ?? density,
    title: asNonEmptyString(content?.title) ?? widget.title,
    subtitle: asNonEmptyString(content?.subtitle) ?? widget.subtitle,
    items,
    action: resolveActivityAction(toRecord(content?.action)),
  };
}

function resolveActivityAction(action: Record<string, unknown> | undefined) {
  if (!action) {
    return undefined;
  }

  const label = asNonEmptyString(action.label);
  if (!label) {
    return undefined;
  }

  const href = asNonEmptyString(action.href);

  return {
    label,
    href,
    onClick: undefined,
    disabled: action.disabled === true || (!href && typeof action.actionKey === 'string'),
  };
}

function resolveMetricAction(action: Record<string, unknown> | undefined) {
  if (!action) {
    return undefined;
  }

  const label = asNonEmptyString(action.label);
  if (!label) {
    return undefined;
  }

  return {
    label,
    href: asNonEmptyString(action.href),
    onClick: undefined,
    disabled: action.disabled === true,
  };
}

function resolveMetricActionFromWidget(action: DashboardWidgetResolvedAction | undefined) {
  if (!action) {
    return undefined;
  }

  return {
    label: action.label,
    href: action.href,
    onClick: action.onClick,
    disabled: action.disabled,
  };
}

function toPrimitiveNode(content: DashboardWidgetContent | undefined): DashboardWidgetPrimitiveNode | undefined {
  const record = toRecord(content);
  if (!record || typeof record.primitive !== 'string' || record.primitive.length === 0) {
    return undefined;
  }

  return {
    primitive: record.primitive,
    props: record.props,
    runtime: record.runtime,
  };
}

function toRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function deriveDashboardPageRenderState(input: {
  kpis: DashboardWidgetView[];
  primaryWidgets: DashboardWidgetView[];
  secondaryWidgets: DashboardWidgetView[];
}) {
  const hasContent = input.kpis.length > 0 || input.primaryWidgets.length > 0 || input.secondaryWidgets.length > 0;

  if (hasContent) {
    return undefined;
  }

  return {
    kind: 'empty' as const,
    state: {
      title: 'No dashboard content',
      description: 'No KPI or widget content is available for this dashboard.',
      variant: 'initial' as const,
      density: 'comfortable' as const,
    },
  };
}

function resolveMetricValue(content: DashboardWidgetContent | undefined): string {
  if (typeof content === 'string' || typeof content === 'number') {
    return String(content);
  }

  const record = toRecord(content);
  if (!record) {
    return '—';
  }

  if (typeof record.value === 'string' || typeof record.value === 'number') {
    return String(record.value);
  }

  return '—';
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asMetricTone(value: unknown): 'default' | 'success' | 'warning' | 'danger' | 'info' | undefined {
  return value === 'default' || value === 'success' || value === 'warning' || value === 'danger' || value === 'info'
    ? value
    : undefined;
}

function asMetricDeltaDirection(value: unknown): 'up' | 'down' | 'neutral' | undefined {
  return value === 'up' || value === 'down' || value === 'neutral' ? value : undefined;
}

function asActivityVariant(value: unknown): 'default' | 'compact' | 'timeline' | undefined {
  return value === 'default' || value === 'compact' || value === 'timeline' ? value : undefined;
}

function asActivityDensity(value: unknown): 'comfortable' | 'compact' | undefined {
  return value === 'comfortable' || value === 'compact' ? value : undefined;
}

function asActivityTone(value: unknown): 'default' | 'info' | 'success' | 'warning' | 'danger' | undefined {
  return value === 'default' || value === 'info' || value === 'success' || value === 'warning' || value === 'danger'
    ? value
    : undefined;
}

function WidgetRendererPlaceholder({ rendererKey }: { rendererKey: string }) {
  return (
    <EmptyState
      title="Widget content is not available"
      description={`Renderer "${rendererKey}" has no mapped runtime content.`}
      variant="widget"
      density="compact"
    />
  );
}

function WidgetActionButton({ action }: { action: DashboardWidgetResolvedAction }) {
  const className = [
    'inline-flex h-7 items-center justify-center gap-1 rounded-md border border-gray-200',
    'bg-white px-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
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
        {action.icon ? <span aria-hidden="true">{action.icon}</span> : null}
        <span>{action.label}</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={action.onClick} disabled={action.disabled} className={className}>
      {action.icon ? <span aria-hidden="true">{action.icon}</span> : null}
      <span>{action.label}</span>
    </button>
  );
}

function resolveHeaderActions(actions: DashboardPageResolvedAction[]): {
  primaryAction?: PageHeaderResolvedAction;
  secondaryActions: PageHeaderResolvedAction[];
} {
  if (actions.length === 0) {
    return {
      primaryAction: undefined,
      secondaryActions: [],
    };
  }

  const normalized = actions.map(toPageHeaderAction);
  const primaryIndex = normalized.findIndex((action) => action.intent !== 'neutral');

  if (primaryIndex === -1) {
    return {
      primaryAction: undefined,
      secondaryActions: normalized,
    };
  }

  return {
    primaryAction: normalized[primaryIndex],
    secondaryActions: normalized.filter((_, index) => index !== primaryIndex),
  };
}

function toPageHeaderAction(action: DashboardPageResolvedAction): PageHeaderResolvedAction {
  return {
    key: action.key,
    label: action.label,
    icon: action.icon,
    href: action.href,
    disabled: action.disabled,
    onClick: action.onClick,
    intent: action.variant === 'destructive' ? 'danger' : action.variant === 'secondary' ? 'neutral' : 'default',
  };
}

function widgetSizeClassName(size: DashboardWidgetView['size']): string {
  switch (size) {
    case 'large':
      return 'xl:col-span-2';
    case 'small':
    case 'medium':
    default:
      return 'xl:col-span-1';
  }
}
