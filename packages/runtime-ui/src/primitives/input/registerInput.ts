import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Input } from './Input';
import { resolveInput, type InputResolverRuntime } from './Input.resolver';
import type { InputViewProps } from './Input.types';

const inputResolver: PrimitiveResolver<unknown, InputViewProps, InputResolverRuntime> = (presentation, runtime) =>
  resolveInput(presentation, runtime);

export function registerInput(): void {
  registerPrimitive('input', {
    component: Input,
    resolver: inputResolver,
  });
}

registerInput();
