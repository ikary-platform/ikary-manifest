import type { BulkCommandBarPresentation } from '@ikary-manifest/presentation';
import type {
  BulkCommandBarResolvedAction,
  BulkCommandBarResolvedUtilityAction,
  BulkCommandBarViewProps,
} from './BulkCommandBar.types';

const DEFAULT_VARIANT: BulkCommandBarViewProps['variant'] = 'list';
const DEFAULT_DENSITY: BulkCommandBarViewProps['density'] = 'comfortable';
const DEFAULT_SCOPE: BulkCommandBarViewProps['scope'] = 'page';
const DEFAULT_ACTION_VARIANT: BulkCommandBarResolvedAction['variant'] = 'default';

export type BuildBulkCommandBarViewModelInput = {
  presentation: BulkCommandBarPresentation;
  actionHandlers?: Record<string, () => void>;
  onAction?: (actionKey: string) => void;
  onClearSelection?: () => void;
  onSelectAllResults?: () => void;
};

export function buildBulkCommandBarViewModel(input: BuildBulkCommandBarViewModelInput): BulkCommandBarViewProps {
  return {
    variant: input.presentation.variant ?? DEFAULT_VARIANT,
    density: input.presentation.density ?? DEFAULT_DENSITY,
    selectedCount: input.presentation.selectedCount,
    scope: input.presentation.scope ?? DEFAULT_SCOPE,
    summaryLabel: normalizeOptionalText(input.presentation.summaryLabel),
    actions: input.presentation.actions.map((action) => resolveAction(action, input)),
    overflowActions: (input.presentation.overflowActions ?? []).map((action) => resolveAction(action, input)),
    clearSelectionAction: resolveUtilityAction({
      label: input.presentation.clearSelectionAction?.label,
      actionKey: input.presentation.clearSelectionAction?.actionKey,
      fallback: input.onClearSelection,
      input,
    }),
    selectAllResultsAction: resolveUtilityAction({
      label: input.presentation.selectAllResultsAction?.label,
      actionKey: input.presentation.selectAllResultsAction?.actionKey,
      fallback: input.onSelectAllResults,
      input,
    }),
  };
}

function resolveAction(
  action: BulkCommandBarPresentation['actions'][number],
  input: BuildBulkCommandBarViewModelInput,
): BulkCommandBarResolvedAction {
  const runtimeHandler = input.actionHandlers?.[action.key];
  const fallbackHandler = input.onAction ? () => input.onAction?.(action.key) : undefined;
  const onClick = runtimeHandler ?? fallbackHandler;

  return {
    key: action.key,
    label: action.label,
    icon: normalizeOptionalText(action.icon),
    variant: action.variant ?? DEFAULT_ACTION_VARIANT,
    disabled: action.disabled ?? typeof onClick !== 'function',
    loading: action.loading ?? false,
    confirm: action.confirm
      ? {
          title: normalizeOptionalText(action.confirm.title),
          description: normalizeOptionalText(action.confirm.description),
          confirmLabel: normalizeOptionalText(action.confirm.confirmLabel),
          cancelLabel: normalizeOptionalText(action.confirm.cancelLabel),
        }
      : undefined,
    onClick,
  };
}

function resolveUtilityAction(args: {
  label: string | undefined;
  actionKey: string | undefined;
  fallback: (() => void) | undefined;
  input: BuildBulkCommandBarViewModelInput;
}): BulkCommandBarResolvedUtilityAction | undefined {
  const label = normalizeOptionalText(args.label);
  if (!label) return undefined;

  const actionHandler = args.actionKey ? args.input.actionHandlers?.[args.actionKey] : undefined;

  const onClick = args.fallback ?? actionHandler;

  return {
    label,
    onClick,
    disabled: typeof onClick !== 'function',
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
