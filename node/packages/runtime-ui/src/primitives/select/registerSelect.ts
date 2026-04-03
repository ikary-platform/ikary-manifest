import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Select } from './Select';
import { resolveSelect, type SelectResolverRuntime } from './Select.resolver';
import type { SelectViewProps } from './Select.types';

const selectResolver: PrimitiveResolver<unknown, SelectViewProps, SelectResolverRuntime> = (presentation, runtime) =>
  resolveSelect(presentation, runtime);

export function registerSelect(): void {
  registerPrimitive('select', {
    component: Select,
    resolver: selectResolver,
  });
}

registerSelect();
