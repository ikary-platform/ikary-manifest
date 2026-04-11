import type { TabsPresentation } from '@ikary/presentation';
import type { TabsResolvedItem, TabsViewProps } from './Tabs.types';

export type BuildTabsViewModelInput = {
  presentation: TabsPresentation;

  /**
   * Runtime action handlers keyed by actionKey from the presentation contract.
   */
  actionHandlers?: Record<string, () => void>;

  /**
   * Optional authorization helper.
   * Used only when hiddenWhenUnauthorized is set.
   */
  isAuthorized?: (actionKey: string) => boolean;
};

export function buildTabsViewModel(input: BuildTabsViewModelInput): TabsViewProps {
  return {
    items: input.presentation.items.map((item) => resolveItem(item, input)),
    activeKey: input.presentation.activeKey,
    overflowMode: input.presentation.overflow?.mode ?? 'scroll',
    collapseBelow: input.presentation.overflow?.collapseBelow,
    variant: input.presentation.variant ?? 'line',
    dense: input.presentation.dense ?? false,
  };
}

function resolveItem(item: TabsPresentation['items'][number], input: BuildTabsViewModelInput): TabsResolvedItem {
  const authorized = resolveAuthorization(item.actionKey, input);
  const hidden = item.hiddenWhenUnauthorized === true && authorized === false;

  const resolved: TabsResolvedItem = {
    key: item.key,
    label: item.label,
    href: item.href,
    count: item.count,
    disabled: item.disabled,
    hidden,
  };

  if (item.actionKey) {
    const handler = input.actionHandlers?.[item.actionKey];
    resolved.onClick = handler;
    resolved.disabled = item.disabled ?? typeof handler !== 'function';
  }

  return resolved;
}

function resolveAuthorization(actionKey: string | undefined, input: BuildTabsViewModelInput): boolean | undefined {
  if (!actionKey) return undefined;
  if (!input.isAuthorized) return undefined;

  return input.isAuthorized(actionKey);
}
