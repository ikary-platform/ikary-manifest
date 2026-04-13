import { validateRuntimeBadgePresentation } from '@ikary/cell-presentation';
import { buildBadgeViewModel, type BuildBadgeViewModelInput } from './Badge.adapter';
import type { BadgeViewProps } from './Badge.types';

export type BadgeResolverRuntime = Omit<BuildBadgeViewModelInput, 'presentation'>;

export function resolveBadge(presentation: unknown, runtime: BadgeResolverRuntime = {}): BadgeViewProps {
  const parsed = validateRuntimeBadgePresentation(presentation);
  if (!parsed.ok) {
    return { label: '' };
  }
  return buildBadgeViewModel({ presentation: parsed.value, ...runtime });
}
