import type { FieldValuePresentation } from '@ikary-manifest/presentation';
import { buildFieldValueViewModel, type BuildFieldValueViewModelInput } from './FieldValue.adapter';

export type FieldValueResolverRuntime = Omit<BuildFieldValueViewModelInput, 'presentation'>;

export function resolveFieldValue(presentation: FieldValuePresentation, runtime: FieldValueResolverRuntime) {
  return buildFieldValueViewModel({
    presentation,
    ...runtime,
  });
}
