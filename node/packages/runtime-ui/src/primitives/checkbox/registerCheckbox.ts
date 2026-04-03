import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Checkbox } from './Checkbox';
import { resolveCheckbox, type CheckboxResolverRuntime } from './Checkbox.resolver';
import type { CheckboxViewProps } from './Checkbox.types';

const checkboxResolver: PrimitiveResolver<unknown, CheckboxViewProps, CheckboxResolverRuntime> = (
  presentation,
  runtime,
) => resolveCheckbox(presentation, runtime);

export function registerCheckbox(): void {
  registerPrimitive('checkbox', {
    component: Checkbox,
    resolver: checkboxResolver,
  });
}

registerCheckbox();
