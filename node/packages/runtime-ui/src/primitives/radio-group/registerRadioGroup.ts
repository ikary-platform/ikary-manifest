import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { RadioGroup } from './RadioGroup';
import { resolveRadioGroup, type RadioGroupResolverRuntime } from './RadioGroup.resolver';
import type { RadioGroupViewProps } from './RadioGroup.types';

const radioGroupResolver: PrimitiveResolver<unknown, RadioGroupViewProps, RadioGroupResolverRuntime> = (
  presentation,
  runtime,
) => resolveRadioGroup(presentation, runtime);

export function registerRadioGroup(): void {
  registerPrimitive('radio-group', {
    component: RadioGroup,
    resolver: radioGroupResolver,
  });
}

registerRadioGroup();
