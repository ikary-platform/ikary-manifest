import { validateRuntimeSkeletonPresentation } from '@ikary/cell-presentation';
import { buildSkeletonViewModel, type BuildSkeletonViewModelInput } from './Skeleton.adapter';
import type { SkeletonViewProps } from './Skeleton.types';

export type SkeletonResolverRuntime = Omit<BuildSkeletonViewModelInput, 'presentation'>;

export function resolveSkeleton(presentation: unknown, runtime: SkeletonResolverRuntime = {}): SkeletonViewProps {
  const parsed = validateRuntimeSkeletonPresentation(presentation);
  if (!parsed.ok) {
    return {};
  }
  return buildSkeletonViewModel({ presentation: parsed.value, ...runtime });
}
