import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Skeleton } from './Skeleton';
import { resolveSkeleton, type SkeletonResolverRuntime } from './Skeleton.resolver';
import type { SkeletonViewProps } from './Skeleton.types';

const skeletonResolver: PrimitiveResolver<unknown, SkeletonViewProps, SkeletonResolverRuntime> = (
  presentation,
  runtime,
) => resolveSkeleton(presentation, runtime);

export function registerSkeleton(): void {
  registerPrimitive('skeleton', { component: Skeleton, resolver: skeletonResolver });
}

registerSkeleton();
