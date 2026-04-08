import type { ErrorStatePresentation } from '@ikary/presentation';
import type { ErrorStateResolvedAction, ErrorStateTechnicalDetailsView, ErrorStateViewProps } from './ErrorState.types';

export type BuildErrorStateViewModelInput = {
  presentation: ErrorStatePresentation;
  actionHandlers?: Record<string, () => void>;
  showTechnicalDetails?: boolean;
};

const DEFAULT_VARIANT: ErrorStateViewProps['variant'] = 'unexpected';
const DEFAULT_SEVERITY: ErrorStateViewProps['severity'] = 'blocking';

export function buildErrorStateViewModel(input: BuildErrorStateViewModelInput): ErrorStateViewProps {
  return {
    title: input.presentation.title.trim(),
    description: normalizeOptionalText(input.presentation.description),
    icon: normalizeOptionalText(input.presentation.icon),
    variant: input.presentation.variant ?? DEFAULT_VARIANT,
    severity: input.presentation.severity ?? DEFAULT_SEVERITY,
    retryAction: resolveRetryAction(input.presentation.retryAction, input),
    secondaryAction: resolveSecondaryAction(input.presentation.secondaryAction, input),
    technicalDetails: resolveTechnicalDetails(input.presentation.technicalDetails, input.showTechnicalDetails === true),
  };
}

function resolveRetryAction(
  action: ErrorStatePresentation['retryAction'],
  input: BuildErrorStateViewModelInput,
): ErrorStateResolvedAction | undefined {
  if (!action) return undefined;

  const onClick = action.actionKey ? input.actionHandlers?.[action.actionKey] : undefined;

  return {
    label: action.label.trim(),
    onClick,
    disabled: Boolean(action.actionKey) && typeof onClick !== 'function',
  };
}

function resolveSecondaryAction(
  action: ErrorStatePresentation['secondaryAction'],
  input: BuildErrorStateViewModelInput,
): ErrorStateResolvedAction | undefined {
  if (!action) return undefined;

  const onClick = action.actionKey ? input.actionHandlers?.[action.actionKey] : undefined;

  return {
    label: action.label.trim(),
    href: normalizeOptionalText(action.href),
    onClick,
    disabled: Boolean(action.actionKey) && typeof onClick !== 'function' && !action.href,
  };
}

function resolveTechnicalDetails(
  details: ErrorStatePresentation['technicalDetails'],
  showTechnicalDetails: boolean,
): ErrorStateTechnicalDetailsView | undefined {
  if (!showTechnicalDetails || !details) {
    return undefined;
  }

  const resolved: ErrorStateTechnicalDetailsView = {
    code: normalizeOptionalText(details.code),
    correlationId: normalizeOptionalText(details.correlationId),
    message: normalizeOptionalText(details.message),
  };

  if (!resolved.code && !resolved.correlationId && !resolved.message) {
    return undefined;
  }

  return resolved;
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
