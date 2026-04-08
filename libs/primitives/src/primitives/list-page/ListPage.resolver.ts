import { ListPagePresentationSchema } from '@ikary/presentation';
import { buildListPageViewModel, type BuildListPageViewModelInput } from './ListPage.adapter';
import type { ListPageViewProps } from './ListPage.types';

export type ListPageResolverRuntime<TRecord extends Record<string, unknown> = Record<string, unknown>> = Omit<
  BuildListPageViewModelInput<TRecord>,
  'presentation'
>;

export function resolveListPage<TRecord extends Record<string, unknown> = Record<string, unknown>>(
  presentation: unknown,
  runtime: ListPageResolverRuntime<TRecord>,
): ListPageViewProps {
  const parsed = ListPagePresentationSchema.safeParse(presentation);

  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'The list page presentation payload is invalid.';

    return {
      renderer: {
        mode: 'data-grid',
        props: {
          rows: [],
          columns: [],
          getRowId: (_row, index) => String(index),
          errorState: `Invalid list page configuration: ${message}`,
        },
      },
    };
  }

  return buildListPageViewModel({
    presentation: parsed.data,
    ...runtime,
  });
}
