import type { ReactNode } from 'react';
import type { DashboardPagePresentation } from '@ikary/cell-presentation';
import type { RenderState } from '../../runtime/render-state.types';
import type {
  DashboardWidgetContent,
  DashboardPageResolvedAction,
  DashboardPageViewProps,
  DashboardWidgetResolvedAction,
  DashboardWidgetView,
} from './DashboardPage.types';

const DEFAULT_VARIANT: DashboardPageViewProps['variant'] = 'cell';
const DEFAULT_DENSITY: DashboardPageViewProps['density'] = 'comfortable';
const DEFAULT_ACTION_VARIANT: DashboardPageResolvedAction['variant'] = 'default';
const DEFAULT_WIDGET_SIZE: DashboardWidgetView['size'] = 'medium';

type DashboardPageActionPresentation = NonNullable<DashboardPagePresentation['actions']>[number];

type DashboardWidgetPresentation = NonNullable<DashboardPagePresentation['primaryWidgets']>[number];

type DashboardRenderStatePresentation =
  | DashboardPagePresentation['renderState']
  | DashboardWidgetPresentation['renderState'];

export type BuildDashboardPageViewModelInput = {
  presentation: DashboardPagePresentation;
  actionHandlers?: Record<string, () => void>;
  onAction?: (actionKey: string) => void;
  widgetContentByWidgetKey?: Record<string, DashboardWidgetContent | ReactNode>;
  widgetContentByRendererKey?: Record<string, DashboardWidgetContent | ReactNode>;
};

export function buildDashboardPageViewModel(input: BuildDashboardPageViewModelInput): DashboardPageViewProps {
  return {
    variant: input.presentation.variant ?? DEFAULT_VARIANT,
    density: input.presentation.density ?? DEFAULT_DENSITY,
    title: input.presentation.title,
    subtitle: normalizeOptionalText(input.presentation.subtitle),
    actions: (input.presentation.actions ?? []).map((action) => resolvePageAction(action, input)),
    kpis: resolveWidgetCollection(input.presentation.kpis ?? [], input),
    primaryWidgets: resolveWidgetCollection(input.presentation.primaryWidgets ?? [], input),
    secondaryWidgets: resolveWidgetCollection(input.presentation.secondaryWidgets ?? [], input),
    renderState: resolveRenderState(input.presentation.renderState, input, 'page'),
  };
}

function resolvePageAction(
  action: DashboardPageActionPresentation,
  input: BuildDashboardPageViewModelInput,
): DashboardPageResolvedAction {
  const actionHandler = action.actionKey ? input.actionHandlers?.[action.actionKey] : undefined;

  const fallbackHandler =
    action.actionKey && input.onAction ? () => input.onAction?.(action.actionKey as string) : undefined;

  const onClick = actionHandler ?? fallbackHandler;

  return {
    key: action.key,
    label: action.label,
    icon: action.icon,
    href: action.href,
    disabled: action.disabled ?? (Boolean(action.actionKey) && typeof onClick !== 'function' && !action.href),
    variant: action.variant ?? DEFAULT_ACTION_VARIANT,
    onClick,
  };
}

function resolveWidgetCollection(
  widgets: DashboardWidgetPresentation[],
  input: BuildDashboardPageViewModelInput,
): DashboardWidgetView[] {
  return widgets.map((widget) => ({
    key: widget.key,
    title: widget.title,
    subtitle: normalizeOptionalText(widget.subtitle),
    size: widget.size ?? DEFAULT_WIDGET_SIZE,
    rendererKey: widget.renderer.key,
    actions: (widget.actions ?? []).map((action) => resolveWidgetAction(action, input)),
    content: resolveWidgetContent(widget, input),
    renderState: resolveRenderState(widget.renderState, input, 'widget'),
  }));
}

function resolveWidgetAction(
  action: NonNullable<DashboardWidgetPresentation['actions']>[number],
  input: BuildDashboardPageViewModelInput,
): DashboardWidgetResolvedAction {
  const actionHandler = action.actionKey ? input.actionHandlers?.[action.actionKey] : undefined;

  const fallbackHandler =
    action.actionKey && input.onAction ? () => input.onAction?.(action.actionKey as string) : undefined;

  const onClick = actionHandler ?? fallbackHandler;

  return {
    key: action.key,
    label: action.label,
    icon: action.icon,
    href: action.href,
    disabled: action.disabled ?? (Boolean(action.actionKey) && typeof onClick !== 'function' && !action.href),
    onClick,
  };
}

function resolveWidgetContent(
  widget: DashboardWidgetPresentation,
  input: BuildDashboardPageViewModelInput,
): DashboardWidgetContent | undefined {
  return input.widgetContentByWidgetKey?.[widget.key] ?? input.widgetContentByRendererKey?.[widget.renderer.key];
}

function resolveRenderState(
  state: DashboardRenderStatePresentation,
  input: BuildDashboardPageViewModelInput,
  scope: 'page' | 'widget',
): RenderState | undefined {
  if (!state) {
    return undefined;
  }

  if (state.kind === 'loading') {
    return {
      kind: 'loading',
      state: resolveLoadingState(state.state, scope),
    };
  }

  if (state.kind === 'empty') {
    return {
      kind: 'empty',
      state: resolveEmptyState(state.state, input),
    };
  }

  return {
    kind: 'error',
    state: resolveErrorState(state.state, input, scope),
  };
}

function resolveLoadingState(
  state: unknown,
  scope: 'page' | 'widget',
): Extract<RenderState, { kind: 'loading' }>['state'] {
  const input = asRecord(state);
  const skeletonInput = asRecord(input?.skeleton);

  return {
    variant: isLoadingVariant(input?.variant) ? input.variant : scope === 'page' ? 'page' : 'card',
    density: isLoadingDensity(input?.density) ? input.density : DEFAULT_DENSITY,
    mode: isLoadingMode(input?.mode) ? input.mode : 'skeleton',
    label:
      typeof input?.label === 'string' && input.label.trim().length > 0
        ? input.label
        : scope === 'page'
          ? 'Loading dashboard'
          : 'Loading widget',
    description:
      typeof input?.description === 'string' && input.description.trim().length > 0 ? input.description : undefined,
    skeleton: skeletonInput
      ? {
          lines: toPositiveInt(skeletonInput.lines, scope === 'page' ? 4 : 3),
          blocks: toPositiveInt(skeletonInput.blocks, 1),
          avatar: skeletonInput.avatar === true,
        }
      : undefined,
  };
}

function resolveEmptyState(
  state: unknown,
  input: BuildDashboardPageViewModelInput,
): Extract<RenderState, { kind: 'empty' }>['state'] {
  const record = asRecord(state);

  return {
    title: typeof record?.title === 'string' && record.title.trim().length > 0 ? record.title : 'No dashboard content',
    description:
      typeof record?.description === 'string' && record.description.trim().length > 0 ? record.description : undefined,
    icon: typeof record?.icon === 'string' && record.icon.trim().length > 0 ? record.icon : undefined,
    variant: isEmptyVariant(record?.variant) ? record.variant : 'initial',
    density: isLoadingDensity(record?.density) ? record.density : DEFAULT_DENSITY,
    primaryAction: resolveStateAction(asRecord(record?.primaryAction), input),
    secondaryAction: resolveStateAction(asRecord(record?.secondaryAction), input),
  };
}

function resolveErrorState(
  state: unknown,
  input: BuildDashboardPageViewModelInput,
  scope: 'page' | 'widget',
): Extract<RenderState, { kind: 'error' }>['state'] {
  const record = asRecord(state);
  const technicalDetailsInput = asRecord(record?.technicalDetails);

  return {
    title:
      typeof record?.title === 'string' && record.title.trim().length > 0
        ? record.title
        : scope === 'page'
          ? 'Unable to load dashboard'
          : 'Unable to load widget',
    description:
      typeof record?.description === 'string' && record.description.trim().length > 0 ? record.description : undefined,
    icon: typeof record?.icon === 'string' && record.icon.trim().length > 0 ? record.icon : undefined,
    variant: isErrorVariant(record?.variant) ? record.variant : scope === 'page' ? 'page' : 'section',
    severity: isErrorSeverity(record?.severity) ? record.severity : scope === 'page' ? 'blocking' : 'soft',
    retryAction: resolveStateAction(asRecord(record?.retryAction), input),
    secondaryAction: resolveStateAction(asRecord(record?.secondaryAction), input),
    technicalDetails: technicalDetailsInput
      ? {
          code: normalizeOptionalText(toStringOrUndefined(technicalDetailsInput.code)),
          correlationId: normalizeOptionalText(toStringOrUndefined(technicalDetailsInput.correlationId)),
          message: normalizeOptionalText(toStringOrUndefined(technicalDetailsInput.message)),
        }
      : undefined,
  };
}

function resolveStateAction(
  actionInput: Record<string, unknown> | undefined,
  input: BuildDashboardPageViewModelInput,
):
  | {
      label: string;
      href?: string;
      onClick?: () => void;
      disabled?: boolean;
    }
  | undefined {
  if (!actionInput || typeof actionInput.label !== 'string' || actionInput.label.trim().length === 0) {
    return undefined;
  }

  const actionKey =
    typeof actionInput.actionKey === 'string' && actionInput.actionKey.trim().length > 0
      ? actionInput.actionKey
      : undefined;

  const actionHandler = actionKey ? input.actionHandlers?.[actionKey] : undefined;
  const fallbackHandler = actionKey && input.onAction ? () => input.onAction?.(actionKey) : undefined;
  const onClick = actionHandler ?? fallbackHandler;

  const href =
    typeof actionInput.href === 'string' && actionInput.href.trim().length > 0 ? actionInput.href : undefined;

  return {
    label: actionInput.label.trim(),
    href,
    onClick,
    disabled: actionInput.disabled === true || (Boolean(actionKey) && typeof onClick !== 'function' && !href),
  };
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function toPositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(value));
}

function toStringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isLoadingVariant(value: unknown): value is 'page' | 'section' | 'card' | 'inline' | 'overlay' {
  return value === 'page' || value === 'section' || value === 'card' || value === 'inline' || value === 'overlay';
}

function isLoadingDensity(value: unknown): value is 'comfortable' | 'compact' {
  return value === 'comfortable' || value === 'compact';
}

function isLoadingMode(value: unknown): value is 'skeleton' | 'spinner' | 'mixed' {
  return value === 'skeleton' || value === 'spinner' || value === 'mixed';
}

function isEmptyVariant(value: unknown): value is 'initial' | 'search' | 'filter' | 'relation' | 'section' | 'widget' {
  return (
    value === 'initial' ||
    value === 'search' ||
    value === 'filter' ||
    value === 'relation' ||
    value === 'section' ||
    value === 'widget'
  );
}

function isErrorVariant(
  value: unknown,
): value is 'page' | 'section' | 'inline' | 'network' | 'unexpected' | 'notFound' {
  return (
    value === 'page' ||
    value === 'section' ||
    value === 'inline' ||
    value === 'network' ||
    value === 'unexpected' ||
    value === 'notFound'
  );
}

function isErrorSeverity(value: unknown): value is 'soft' | 'blocking' {
  return value === 'soft' || value === 'blocking';
}
