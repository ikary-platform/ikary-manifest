import type { CardListPresentation } from '@ikary/cell-presentation';
import { buildCardListViewModel, type BuildCardListViewModelInput } from './CardList.adapter';

export type CardListResolverRuntime<TRecord extends Record<string, unknown> = Record<string, unknown>> = Omit<
  BuildCardListViewModelInput<TRecord>,
  'presentation'
>;

export function resolveCardList<TRecord extends Record<string, unknown> = Record<string, unknown>>(
  presentation: CardListPresentation,
  runtime: CardListResolverRuntime<TRecord>,
) {
  return buildCardListViewModel({
    presentation,
    ...runtime,
  });
}
