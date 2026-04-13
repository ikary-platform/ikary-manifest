import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Label } from './Label';
import { resolveLabel, type LabelResolverRuntime } from './Label.resolver';
import type { LabelViewProps } from './Label.types';

const labelResolver: PrimitiveResolver<unknown, LabelViewProps, LabelResolverRuntime> = (presentation, runtime) =>
  resolveLabel(presentation, runtime);

export function registerLabel(): void {
  registerPrimitive('label', { component: Label, resolver: labelResolver });
}

registerLabel();
