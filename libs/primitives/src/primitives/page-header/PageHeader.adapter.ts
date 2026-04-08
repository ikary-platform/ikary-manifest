import type { ReactNode } from 'react';
import type { PageHeaderPresentation } from '@ikary/presentation';
import type { PageHeaderLowerSlotType, PageHeaderResolvedAction, PageHeaderViewProps } from './PageHeader.types';

export type BuildPageHeaderViewModelInput = {
  presentation: PageHeaderPresentation;

  /**
   * Runtime action handlers keyed by actionKey from the presentation contract.
   */
  actionHandlers?: Record<string, () => void>;

  /**
   * Optional authorization helper.
   * Used only when hiddenWhenUnauthorized is set on an action.
   */
  isAuthorized?: (actionKey: string) => boolean;

  /**
   * Optional resolved content for the lower slot.
   * The contract declares the lower slot type.
   * Runtime decides what actual content should be rendered there.
   */
  lowerSlotContent?: Partial<Record<PageHeaderLowerSlotType, ReactNode>>;
};

export function buildPageHeaderViewModel(input: BuildPageHeaderViewModelInput): PageHeaderViewProps {
  return {
    title: input.presentation.title,
    description: input.presentation.description,
    eyebrow: input.presentation.eyebrow,

    breadcrumbs: input.presentation.breadcrumbs,
    meta: input.presentation.meta,

    primaryAction: input.presentation.primaryAction
      ? resolveAction(input.presentation.primaryAction, input)
      : undefined,

    secondaryActions: input.presentation.secondaryActions?.map((action) => resolveAction(action, input)),

    lowerSlot: input.presentation.lowerSlot
      ? {
          type: input.presentation.lowerSlot.type,
          content: input.lowerSlotContent?.[input.presentation.lowerSlot.type],
        }
      : undefined,

    dense: input.presentation.dense,
  };
}

function resolveAction(
  action: NonNullable<PageHeaderPresentation['primaryAction']>,
  input: BuildPageHeaderViewModelInput,
): PageHeaderResolvedAction {
  const authorized = resolveAuthorization(action.actionKey, input);
  const hidden = action.hiddenWhenUnauthorized === true && authorized === false;

  const resolvedAction: PageHeaderResolvedAction = {
    key: action.key,
    label: action.label,
    icon: action.icon,
    intent: action.intent,
    href: action.href,
    disabled: action.disabled,
    hidden,
  };

  if (action.actionKey) {
    const handler = input.actionHandlers?.[action.actionKey];

    resolvedAction.onClick = handler;
    resolvedAction.disabled = action.disabled ?? typeof handler !== 'function';
  }

  return resolvedAction;
}

function resolveAuthorization(
  actionKey: string | undefined,
  input: BuildPageHeaderViewModelInput,
): boolean | undefined {
  if (!actionKey) return undefined;
  if (!input.isAuthorized) return undefined;

  return input.isAuthorized(actionKey);
}
