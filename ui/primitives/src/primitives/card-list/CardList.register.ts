import type { CardListPresentation } from '@ikary/presentation';
import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { CardList } from './CardList';
import { resolveCardList } from './CardList.resolver';
import type { CardListViewProps } from './CardList.types';
import type { CardListResolverRuntime } from './CardList.resolver';

const cardListResolver: PrimitiveResolver<
  CardListPresentation,
  CardListViewProps<Record<string, unknown>>,
  CardListResolverRuntime<Record<string, unknown>>
> = (presentation, runtime) => resolveCardList(presentation, runtime);

registerPrimitive('card-list', {
  component: CardList,
  resolver: cardListResolver,
});
