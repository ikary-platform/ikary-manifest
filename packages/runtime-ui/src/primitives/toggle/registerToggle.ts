import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Toggle } from './Toggle';
import { resolveToggle, type ToggleResolverRuntime } from './Toggle.resolver';
import type { ToggleViewProps } from './Toggle.types';

const toggleResolver: PrimitiveResolver<unknown, ToggleViewProps, ToggleResolverRuntime> = (presentation, runtime) =>
  resolveToggle(presentation, runtime);

export function registerToggle(): void {
  registerPrimitive('toggle', {
    component: Toggle,
    resolver: toggleResolver,
  });
}

registerToggle();
