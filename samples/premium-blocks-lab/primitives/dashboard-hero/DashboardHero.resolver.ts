import {
  DashboardHeroPresentationSchema,
  type DashboardHeroProps,
} from './DashboardHeroPresentationSchema';

export function resolveDashboardHero(
  props: DashboardHeroProps & { __slotContext?: unknown },
): DashboardHeroProps {
  const { __slotContext, ...rest } = props as Record<string, unknown>;
  return DashboardHeroPresentationSchema.parse(rest);
}
