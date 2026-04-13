import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { DateInput } from './DateInput';
import { resolveDateInput, type DateInputResolverRuntime } from './DateInput.resolver';
import type { DateInputViewProps } from './DateInput.types';

const dateInputResolver: PrimitiveResolver<unknown, DateInputViewProps, DateInputResolverRuntime> = (
  presentation,
  runtime,
) => resolveDateInput(presentation, runtime);

export function registerDateInput(): void {
  registerPrimitive('date-input', {
    component: DateInput,
    resolver: dateInputResolver,
  });
}

registerDateInput();
