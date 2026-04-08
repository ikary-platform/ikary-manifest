import { validateRuntimeBulkCommandBarPresentation } from '@ikary/presentation';
import { buildBulkCommandBarViewModel, type BuildBulkCommandBarViewModelInput } from './BulkCommandBar.adapter';
import type { BulkCommandBarViewProps } from './BulkCommandBar.types';

export type BulkCommandBarResolverRuntime = Omit<BuildBulkCommandBarViewModelInput, 'presentation'>;

export function resolveBulkCommandBar(
  presentation: unknown,
  runtime: BulkCommandBarResolverRuntime = {},
): BulkCommandBarViewProps {
  const parsed = validateRuntimeBulkCommandBarPresentation(presentation);

  if (!parsed.ok) {
    return {
      variant: 'list',
      density: 'comfortable',
      scope: 'page',
      selectedCount: 0,
      summaryLabel: 'Invalid bulk command bar configuration',
      actions: [],
      overflowActions: [],
    };
  }

  return buildBulkCommandBarViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
