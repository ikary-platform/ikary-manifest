import { validateRuntimeCardPresentation } from '@ikary/cell-presentation';
import { buildCardViewModel, type BuildCardViewModelInput } from './Card.adapter';
import type { CardViewProps } from './Card.types';

export type CardResolverRuntime = Omit<BuildCardViewModelInput, 'presentation'>;

export function resolveCard(presentation: unknown, runtime: CardResolverRuntime = {}): CardViewProps {
  const parsed = validateRuntimeCardPresentation(presentation);
  if (!parsed.ok) {
    return {};
  }
  return buildCardViewModel({ presentation: parsed.value, ...runtime });
}
