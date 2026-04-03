import { validateRuntimeActivityFeedPresentation } from '@ikary-manifest/presentation';
import { buildActivityFeedViewModel, type BuildActivityFeedViewModelInput } from './ActivityFeed.adapter';
import type { ActivityFeedViewProps } from './ActivityFeed.types';

export type ActivityFeedResolverRuntime = Omit<BuildActivityFeedViewModelInput, 'presentation'>;

export function resolveActivityFeed(
  presentation: unknown,
  runtime: ActivityFeedResolverRuntime = {},
): ActivityFeedViewProps {
  const parsed = validateRuntimeActivityFeedPresentation(presentation);

  if (!parsed.ok) {
    return {
      variant: 'default',
      density: 'comfortable',
      items: [],
      renderState: {
        kind: 'error',
        state: {
          title: 'Invalid activity feed configuration',
          description: parsed.errors[0]?.message ?? 'The activity feed presentation payload is invalid.',
          variant: 'section',
          severity: 'soft',
        },
      },
    };
  }

  return buildActivityFeedViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
