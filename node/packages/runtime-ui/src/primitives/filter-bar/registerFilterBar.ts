import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { FilterBar } from './FilterBar';
import { resolveFilterBar, type FilterBarResolverRuntime } from './FilterBar.resolver';
import type { FilterBarViewProps } from './FilterBar.types';

const filterBarResolver: PrimitiveResolver<unknown, FilterBarViewProps, FilterBarResolverRuntime> = (
  presentation,
  runtime,
) => resolveFilterBar(presentation, runtime);

export function registerFilterBar(): void {
  registerPrimitive('filter-bar', {
    component: FilterBar,
    resolver: filterBarResolver,
  });
}

registerFilterBar();
