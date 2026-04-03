import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { ActivityFeed } from './ActivityFeed';
import { resolveActivityFeed, type ActivityFeedResolverRuntime } from './ActivityFeed.resolver';
import type { ActivityFeedViewProps } from './ActivityFeed.types';

const activityFeedResolver: PrimitiveResolver<unknown, ActivityFeedViewProps, ActivityFeedResolverRuntime> = (
  presentation,
  runtime,
) => resolveActivityFeed(presentation, runtime);

export function registerActivityFeed(): void {
  registerPrimitive('activity-feed', {
    component: ActivityFeed,
    resolver: activityFeedResolver,
  });
}

registerActivityFeed();
