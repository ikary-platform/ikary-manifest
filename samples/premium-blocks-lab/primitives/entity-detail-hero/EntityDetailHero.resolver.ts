import {
  EntityDetailHeroPresentationSchema,
  type EntityDetailHeroProps,
} from './EntityDetailHeroPresentationSchema';

export function resolveEntityDetailHero(
  props: EntityDetailHeroProps & { __slotContext?: unknown },
): EntityDetailHeroProps {
  const { __slotContext, ...rest } = props as Record<string, unknown>;
  return EntityDetailHeroPresentationSchema.parse(rest);
}
