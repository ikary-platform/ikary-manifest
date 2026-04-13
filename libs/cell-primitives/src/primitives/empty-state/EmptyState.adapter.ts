import type { EmptyStatePresentation } from '@ikary/cell-presentation';
import type { EmptyStateResolvedAction, EmptyStateViewProps } from './EmptyState.types';

export type BuildEmptyStateViewModelInput = {
  presentation: EmptyStatePresentation;
  actionHandlers?: Record<string, () => void>;
};

export function buildEmptyStateViewModel(input: BuildEmptyStateViewModelInput): EmptyStateViewProps {
  return {
    title: input.presentation.title.trim(),
    description: normalizeOptionalText(input.presentation.description),
    icon: normalizeOptionalText(input.presentation.icon),
    variant: input.presentation.variant ?? 'initial',
    density: input.presentation.density ?? 'comfortable',
    primaryAction: resolveAction(input.presentation.primaryAction, input),
    secondaryAction: resolveAction(input.presentation.secondaryAction, input),
  };
}

function resolveAction(
  action: EmptyStatePresentation['primaryAction'] | EmptyStatePresentation['secondaryAction'],
  input: BuildEmptyStateViewModelInput,
): EmptyStateResolvedAction | undefined {
  if (!action) return undefined;

  const onClick = action.actionKey ? input.actionHandlers?.[action.actionKey] : undefined;

  return {
    label: action.label.trim(),
    href: normalizeOptionalText(action.href),
    onClick,
    disabled: Boolean(action.actionKey) && typeof onClick !== 'function' && !action.href,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
