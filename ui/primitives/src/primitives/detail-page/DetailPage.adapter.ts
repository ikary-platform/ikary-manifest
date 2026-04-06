import type { ReactNode } from 'react';
import type { DetailPagePresentation } from '@ikary-manifest/presentation';
import type { DetailPagePageRenderState, DetailPageResolvedAction, DetailPageViewProps } from './DetailPage.types';

const DEFAULT_ACTION_VARIANT: DetailPageResolvedAction['variant'] = 'default';

export type BuildDetailPageViewModelInput = {
  presentation: DetailPagePresentation;
  actionHandlers?: Record<string, () => void>;
  onAction?: (actionKey: string) => void;
  content?: ReactNode;
  contentByKey?: Record<string, ReactNode>;
};

export function buildDetailPageViewModel(input: BuildDetailPageViewModelInput): DetailPageViewProps {
  return {
    title: input.presentation.title,
    metadata: input.presentation.metadata.map((item) => ({
      key: item.key,
      label: item.label,
      value: item.value,
    })),
    actions: (input.presentation.actions ?? []).map((action) => resolveAction(action, input)),
    tabs: input.presentation.tabs.map((tab) => ({
      key: tab.key,
      label: tab.label,
      href: tab.href,
      disabled: tab.disabled,
      kind: tab.kind,
    })),
    activeTabKey: input.presentation.activeTabKey,
    overviewEditable: input.presentation.overviewEditable ?? false,
    isEditing: input.presentation.isEditing ?? false,
    contentKey: input.presentation.content.key,
    content: input.content ?? input.contentByKey?.[input.presentation.content.key],
    renderState: resolveRenderState(input.presentation.renderState),
  };
}

function resolveAction(
  action: NonNullable<DetailPagePresentation['actions']>[number],
  input: BuildDetailPageViewModelInput,
): DetailPageResolvedAction {
  const actionHandler = action.actionKey ? input.actionHandlers?.[action.actionKey] : undefined;

  const fallbackHandler =
    action.actionKey && input.onAction ? () => input.onAction?.(action.actionKey as string) : undefined;

  const onClick = actionHandler ?? fallbackHandler;

  if (action.actionKey) {
    return {
      key: action.key,
      label: action.label,
      icon: action.icon,
      href: action.href,
      disabled: action.disabled ?? typeof onClick !== 'function',
      variant: action.variant ?? DEFAULT_ACTION_VARIANT,
      onClick,
    };
  }

  return {
    key: action.key,
    label: action.label,
    icon: action.icon,
    href: action.href,
    disabled: action.disabled,
    variant: action.variant ?? DEFAULT_ACTION_VARIANT,
  };
}

function resolveRenderState(
  state: DetailPagePresentation['renderState'] | undefined,
): DetailPagePageRenderState | undefined {
  if (!state) {
    return undefined;
  }

  if (state.kind === 'loading') {
    return {
      kind: 'loading',
      state: resolveLoadingState(state.state),
    };
  }

  return {
    kind: 'error',
    state: resolveErrorState(state.state),
  };
}

function resolveLoadingState(state: unknown): Extract<DetailPagePageRenderState, { kind: 'loading' }>['state'] {
  const input = asRecord(state);
  const skeletonInput = asRecord(input?.skeleton);

  return {
    variant: isLoadingVariant(input?.variant) ? input?.variant : 'page',
    density: isLoadingDensity(input?.density) ? input?.density : 'comfortable',
    mode: isLoadingMode(input?.mode) ? input?.mode : 'skeleton',
    label: typeof input?.label === 'string' && input.label.trim().length > 0 ? input.label : 'Loading detail page',
    description:
      typeof input?.description === 'string' && input.description.trim().length > 0 ? input.description : undefined,
    skeleton: skeletonInput
      ? {
          lines: toPositiveInt(skeletonInput.lines, 3),
          blocks: toPositiveInt(skeletonInput.blocks, 1),
          avatar: skeletonInput.avatar === true,
        }
      : undefined,
  };
}

function resolveErrorState(state: unknown): Extract<DetailPagePageRenderState, { kind: 'error' }>['state'] {
  const input = asRecord(state);
  const retryAction = resolveErrorAction(asRecord(input?.retryAction));
  const secondaryAction = resolveErrorAction(asRecord(input?.secondaryAction));
  const technicalDetailsInput = asRecord(input?.technicalDetails);

  return {
    title:
      typeof input?.title === 'string' && input.title.trim().length > 0 ? input.title : 'Unable to load detail page',
    description:
      typeof input?.description === 'string' && input.description.trim().length > 0 ? input.description : undefined,
    icon: typeof input?.icon === 'string' && input.icon.trim().length > 0 ? input.icon : undefined,
    variant: isErrorVariant(input?.variant) ? input?.variant : 'page',
    severity: isErrorSeverity(input?.severity) ? input?.severity : 'blocking',
    retryAction,
    secondaryAction,
    technicalDetails: technicalDetailsInput
      ? {
          code:
            typeof technicalDetailsInput.code === 'string' && technicalDetailsInput.code.trim().length > 0
              ? technicalDetailsInput.code
              : undefined,
          correlationId:
            typeof technicalDetailsInput.correlationId === 'string' &&
            technicalDetailsInput.correlationId.trim().length > 0
              ? technicalDetailsInput.correlationId
              : undefined,
          message:
            typeof technicalDetailsInput.message === 'string' && technicalDetailsInput.message.trim().length > 0
              ? technicalDetailsInput.message
              : undefined,
        }
      : undefined,
  };
}

function resolveErrorAction(input: Record<string, unknown> | undefined):
  | {
      label: string;
      href?: string;
      disabled?: boolean;
    }
  | undefined {
  if (!input || typeof input.label !== 'string' || input.label.trim().length === 0) {
    return undefined;
  }

  return {
    label: input.label,
    href: typeof input.href === 'string' && input.href.trim().length > 0 ? input.href : undefined,
    disabled: input.disabled === true,
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

function isLoadingVariant(value: unknown): value is 'page' | 'section' | 'card' | 'inline' | 'overlay' {
  return value === 'page' || value === 'section' || value === 'card' || value === 'inline' || value === 'overlay';
}

function isLoadingDensity(value: unknown): value is 'comfortable' | 'compact' {
  return value === 'comfortable' || value === 'compact';
}

function isLoadingMode(value: unknown): value is 'skeleton' | 'spinner' | 'mixed' {
  return value === 'skeleton' || value === 'spinner' || value === 'mixed';
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
