import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Button } from './Button';
import { resolveButton, type ButtonResolverRuntime } from './Button.resolver';
import type { ButtonViewProps } from './Button.types';

const buttonResolver: PrimitiveResolver<unknown, ButtonViewProps, ButtonResolverRuntime> = (presentation, runtime) =>
  resolveButton(presentation, runtime);

export function registerButton(): void {
  registerPrimitive('button', { component: Button, resolver: buttonResolver });
}

registerButton();
