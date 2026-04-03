import type { ActivityFeedPresentation } from '@ikary-manifest/presentation';
import type { RenderState } from '../../runtime/render-state.types';
import type { ActivityFeedResolvedAction, ActivityFeedResolvedItem, ActivityFeedViewProps } from './ActivityFeed.types';

const DEFAULT_VARIANT: ActivityFeedViewProps['variant'] = 'default';
const DEFAULT_DENSITY: ActivityFeedViewProps['density'] = 'comfortable';
const DEFAULT_TONE: ActivityFeedResolvedItem['tone'] = 'default';

export type BuildActivityFeedViewModelInput = {
  presentation: ActivityFeedPresentation;
  actionHandlers?: Record<string, () => void>;
  onAction?: (actionKey: string) => void;
  onFeedAction?: (actionKey?: string) => void;
  onItemAction?: (itemKey: string, actionKey?: string) => void;
};

export function buildActivityFeedViewModel(input: BuildActivityFeedViewModelInput): ActivityFeedViewProps {
  const variant = input.presentation.variant ?? DEFAULT_VARIANT;
  const density = input.presentation.density ?? DEFAULT_DENSITY;
  const limit = normalizeLimit(input.presentation.limit);

  const items = input.presentation.items.map((item) => resolveItem(item, input));

  return {
    variant,
    density,
    title: normalizeOptionalText(input.presentation.title),
    subtitle: normalizeOptionalText(input.presentation.subtitle),
    items: limit === undefined ? items : items.slice(0, limit),
    limit,
    action: resolveAction(input.presentation.action, input),
    renderState: resolveRenderState(input.presentation.renderState, variant, density, input),
  };
}

function resolveAction(
  action: ActivityFeedPresentation['action'],
  input: BuildActivityFeedViewModelInput,
): ActivityFeedResolvedAction | undefined {
  if (!action) {
    return undefined;
  }

  const actionKey = normalizeOptionalText(action.actionKey);
  const actionHandler = actionKey ? input.actionHandlers?.[actionKey] : undefined;
  const fallbackHandler = actionKey && input.onAction ? () => input.onAction?.(actionKey) : undefined;
  const feedHandler = input.onFeedAction ? () => input.onFeedAction?.(actionKey) : undefined;
  const onClick = actionHandler ?? fallbackHandler ?? feedHandler;

  const href = normalizeOptionalText(action.href);

  return {
    label: action.label.trim(),
    href,
    onClick,
    disabled: Boolean(actionKey) && typeof onClick !== 'function' && !href,
  };
}

function resolveItem(
  item: ActivityFeedPresentation['items'][number],
  input: BuildActivityFeedViewModelInput,
): ActivityFeedResolvedItem {
  const actionKey = normalizeOptionalText(item.actionKey);
  const actionHandler = actionKey ? input.actionHandlers?.[actionKey] : undefined;
  const fallbackHandler = actionKey && input.onAction ? () => input.onAction?.(actionKey) : undefined;
  const itemHandler = input.onItemAction ? () => input.onItemAction?.(item.key, actionKey) : undefined;

  const onClick = actionHandler ?? fallbackHandler ?? itemHandler;
  const href = normalizeOptionalText(item.href);

  return {
    key: item.key,
    summary: item.summary,
    actor: normalizeOptionalText(item.actor),
    timestamp: normalizeOptionalText(item.timestamp),
    targetLabel: normalizeOptionalText(item.targetLabel),
    icon: normalizeOptionalText(item.icon),
    tone: item.tone ?? DEFAULT_TONE,
    href,
    onClick,
    disabled: Boolean(actionKey) && typeof onClick !== 'function' && !href,
  };
}

function normalizeLimit(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(0, Math.trunc(value));
}

function resolveRenderState(
  state: ActivityFeedPresentation['renderState'],
  variant: ActivityFeedViewProps['variant'],
  density: ActivityFeedViewProps['density'],
  input: BuildActivityFeedViewModelInput,
): RenderState | undefined {
  if (!state) {
    return undefined;
  }

  if (state.kind === 'loading') {
    return {
      kind: 'loading',
      state: resolveLoadingState(state.state, variant, density),
    };
  }

  if (state.kind === 'empty') {
    return {
      kind: 'empty',
      state: resolveEmptyState(state.state, variant, density, input),
    };
  }

  return {
    kind: 'error',
    state: resolveErrorState(state.state, variant, density, input),
  };
}

function resolveLoadingState(
  state: unknown,
  variant: ActivityFeedViewProps['variant'],
  density: ActivityFeedViewProps['density'],
): Extract<RenderState, { kind: 'loading' }>['state'] {
  const input = asRecord(state);
  const skeletonInput = asRecord(input?.skeleton);

  return {
    variant: isLoadingVariant(input?.variant) ? input.variant : variant === 'compact' ? 'inline' : 'section',
    density: isDensity(input?.density) ? input.density : density,
    mode: isLoadingMode(input?.mode) ? input.mode : 'skeleton',
    label: typeof input?.label === 'string' && input.label.trim().length > 0 ? input.label : 'Loading activity',
    description:
      typeof input?.description === 'string' && input.description.trim().length > 0 ? input.description : undefined,
    skeleton: skeletonInput
      ? {
          lines: toPositiveInt(skeletonInput.lines, density === 'compact' ? 2 : 3),
          blocks: toPositiveInt(skeletonInput.blocks, 1),
          avatar: skeletonInput.avatar === true,
        }
      : undefined,
  };
}

function resolveEmptyState(
  state: unknown,
  variant: ActivityFeedViewProps['variant'],
  density: ActivityFeedViewProps['density'],
  input: BuildActivityFeedViewModelInput,
): Extract<RenderState, { kind: 'empty' }>['state'] {
  const record = asRecord(state);

  return {
    title: typeof record?.title === 'string' && record.title.trim().length > 0 ? record.title : 'No recent activity',
    description:
      typeof record?.description === 'string' && record.description.trim().length > 0 ? record.description : undefined,
    icon: typeof record?.icon === 'string' && record.icon.trim().length > 0 ? record.icon : undefined,
    variant: isEmptyVariant(record?.variant) ? record.variant : variant === 'compact' ? 'widget' : 'section',
    density: isDensity(record?.density) ? record.density : density,
    primaryAction: resolveStateAction(asRecord(record?.primaryAction), input),
    secondaryAction: resolveStateAction(asRecord(record?.secondaryAction), input),
  };
}

function resolveErrorState(
  state: unknown,
  variant: ActivityFeedViewProps['variant'],
  density: ActivityFeedViewProps['density'],
  input: BuildActivityFeedViewModelInput,
): Extract<RenderState, { kind: 'error' }>['state'] {
  const record = asRecord(state);
  const technicalDetailsInput = asRecord(record?.technicalDetails);

  return {
    title:
      typeof record?.title === 'string' && record.title.trim().length > 0 ? record.title : 'Unable to load activity',
    description:
      typeof record?.description === 'string' && record.description.trim().length > 0 ? record.description : undefined,
    icon: typeof record?.icon === 'string' && record.icon.trim().length > 0 ? record.icon : undefined,
    variant: isErrorVariant(record?.variant) ? record.variant : variant === 'compact' ? 'inline' : 'section',
    severity: isErrorSeverity(record?.severity) ? record.severity : 'soft',
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
  input: BuildActivityFeedViewModelInput,
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

function isDensity(value: unknown): value is ActivityFeedViewProps['density'] {
  return value === 'comfortable' || value === 'compact';
}

function isLoadingVariant(value: unknown): value is 'page' | 'section' | 'card' | 'inline' | 'overlay' {
  return value === 'page' || value === 'section' || value === 'card' || value === 'inline' || value === 'overlay';
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
