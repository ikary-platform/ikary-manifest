import type { TabsPresentation } from '@ikary-manifest/presentation';
import { buildTabsViewModel, type BuildTabsViewModelInput } from './Tabs.adapter';

export type TabsResolverRuntime = Omit<BuildTabsViewModelInput, 'presentation'>;

export function resolveTabs(presentation: TabsPresentation, runtime: TabsResolverRuntime) {
  return buildTabsViewModel({
    presentation,
    ...runtime,
  });
}
