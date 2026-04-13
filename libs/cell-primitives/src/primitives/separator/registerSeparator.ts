import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Separator } from './Separator';
import { resolveSeparator, type SeparatorResolverRuntime } from './Separator.resolver';
import type { SeparatorViewProps } from './Separator.types';

const separatorResolver: PrimitiveResolver<unknown, SeparatorViewProps, SeparatorResolverRuntime> = (
  presentation,
  runtime,
) => resolveSeparator(presentation, runtime);

export function registerSeparator(): void {
  registerPrimitive('separator', { component: Separator, resolver: separatorResolver });
}

registerSeparator();
