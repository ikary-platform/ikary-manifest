import { useQuery } from '@tanstack/react-query';
import { fetchDemoStatus, type DemoStatus } from '../stream/demo-api';

/**
 * Polled probe for the demo's availability.
 *
 * Uses TanStack Query instead of a `useEffect` fetch so:
 *  - the caller is pure (reads `data`, renders accordingly, no lifecycle code);
 *  - failed probes don't blank the UI - we stay optimistic with `placeholderData`;
 *  - the `?demo=off|on|budget|...` override parsed inside `fetchDemoStatus`
 *    still flows through the same code path.
 */
export function useDemoStatus(): DemoStatus {
  const query = useQuery({
    queryKey: ['demo-status'],
    queryFn: ({ signal }) => fetchDemoStatus(signal),
    staleTime: 60_000,
    placeholderData: { aiAvailable: true } satisfies DemoStatus,
    retry: 0,
  });
  return query.data ?? { aiAvailable: true };
}
