import type { MetricCardPresentation } from '@ikary-manifest/presentation';
import type { RenderState } from '../../runtime/render-state.types';
import type { MetricCardResolvedAction, MetricCardViewProps } from './MetricCard.types';

const DEFAULT_VARIANT: MetricCardViewProps['variant'] = 'default';
const DEFAULT_DENSITY: MetricCardViewProps['density'] = 'comfortable';
const DEFAULT_TONE: MetricCardViewProps['tone'] = 'default';

export type BuildMetricCardViewModelInput = {
  presentation: MetricCardPresentation;
  actionHandlers?: Record<string, () => void>;
  onAction?: (actionKey: string) => void;
};

export function buildMetricCardViewModel(input: BuildMetricCardViewModelInput): MetricCardViewProps {
  const density = input.presentation.density ?? DEFAULT_DENSITY;

  return {
    variant: input.presentation.variant ?? DEFAULT_VARIANT,
    density,
    label: input.presentation.label.trim(),
    value: input.presentation.value.trim(),
    subtitle: normalizeOptionalText(input.presentation.subtitle),
    delta: normalizeOptionalText(input.presentation.delta),
    deltaDirection: input.presentation.deltaDirection,
    tone: input.presentation.tone ?? DEFAULT_TONE,
    icon: normalizeOptionalText(input.presentation.icon),
    action: resolveAction(input.presentation.action, input),
    renderState: resolveRenderState(input.presentation.renderState, density, input),
  };
}

function resolveAction(
  action: MetricCardPresentation['action'],
  input: BuildMetricCardViewModelInput,
): MetricCardResolvedAction | undefined {
  if (!action) {
    return undefined;
  }

  const actionHandler = action.actionKey ? input.actionHandlers?.[action.actionKey] : undefined;

  const fallbackHandler =
    action.actionKey && input.onAction ? () => input.onAction?.(action.actionKey as string) : undefined;

  const onClick = actionHandler ?? fallbackHandler;

  return {
    label: action.label.trim(),
    href: normalizeOptionalText(action.href),
    onClick,
    disabled: Boolean(action.actionKey) && typeof onClick !== 'function' && !action.href,
  };
}

function resolveRenderState(
  state: MetricCardPresentation['renderState'],
  density: MetricCardViewProps['density'],
  input: BuildMetricCardViewModelInput,
): RenderState | undefined {
  if (!state) {
    return undefined;
  }

  if (state.kind === 'loading') {
    return {
      kind: 'loading',
      state: resolveLoadingState(state.state, density),
    };
  }

  if (state.kind === 'empty') {
    return {
      kind: 'empty',
      state: resolveEmptyState(state.state, density, input),
    };
  }

  return {
    kind: 'error',
    state: resolveErrorState(state.state, density, input),
  };
}

function resolveLoadingState(
  state: unknown,
  density: MetricCardViewProps['density'],
): Extract<RenderState, { kind: 'loading' }>['state'] {
  const input = asRecord(state);
  const skeletonInput = asRecord(input?.skeleton);

  return {
    variant: isLoadingVariant(input?.variant) ? input.variant : 'inline',
    density: isDensity(input?.density) ? input.density : density,
    mode: isLoadingMode(input?.mode) ? input.mode : 'skeleton',
    label: typeof input?.label === 'string' && input.label.trim().length > 0 ? input.label : 'Loading metric',
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
  density: MetricCardViewProps['density'],
  input: BuildMetricCardViewModelInput,
): Extract<RenderState, { kind: 'empty' }>['state'] {
  const record = asRecord(state);

  return {
    title:
      typeof record?.title === 'string' && record.title.trim().length > 0 ? record.title : 'No metric data available',
    description:
      typeof record?.description === 'string' && record.description.trim().length > 0 ? record.description : undefined,
    icon: typeof record?.icon === 'string' && record.icon.trim().length > 0 ? record.icon : undefined,
    variant: isEmptyVariant(record?.variant) ? record.variant : 'widget',
    density: isDensity(record?.density) ? record.density : density,
    primaryAction: resolveStateAction(asRecord(record?.primaryAction), input),
    secondaryAction: resolveStateAction(asRecord(record?.secondaryAction), input),
  };
}

function resolveErrorState(
  state: unknown,
  density: MetricCardViewProps['density'],
  input: BuildMetricCardViewModelInput,
): Extract<RenderState, { kind: 'error' }>['state'] {
  const record = asRecord(state);
  const technicalDetailsInput = asRecord(record?.technicalDetails);

  return {
    title: typeof record?.title === 'string' && record.title.trim().length > 0 ? record.title : 'Metric unavailable',
    description:
      typeof record?.description === 'string' && record.description.trim().length > 0 ? record.description : undefined,
    icon: typeof record?.icon === 'string' && record.icon.trim().length > 0 ? record.icon : undefined,
    variant: isErrorVariant(record?.variant) ? record.variant : 'inline',
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
  input: BuildMetricCardViewModelInput,
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

function isDensity(value: unknown): value is 'comfortable' | 'compact' {
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
