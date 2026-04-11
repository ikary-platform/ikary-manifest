import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Progress } from './Progress';
import { resolveProgress, type ProgressResolverRuntime } from './Progress.resolver';
import type { ProgressViewProps } from './Progress.types';

const progressResolver: PrimitiveResolver<unknown, ProgressViewProps, ProgressResolverRuntime> = (
  presentation,
  runtime,
) => resolveProgress(presentation, runtime);

export function registerProgress(): void {
  registerPrimitive('progress', { component: Progress, resolver: progressResolver });
}

registerProgress();
