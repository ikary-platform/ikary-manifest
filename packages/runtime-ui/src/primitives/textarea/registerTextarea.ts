import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Textarea } from './Textarea';
import { resolveTextarea, type TextareaResolverRuntime } from './Textarea.resolver';
import type { TextareaViewProps } from './Textarea.types';

const textareaResolver: PrimitiveResolver<unknown, TextareaViewProps, TextareaResolverRuntime> = (
  presentation,
  runtime,
) => resolveTextarea(presentation, runtime);

export function registerTextarea(): void {
  registerPrimitive('textarea', {
    component: Textarea,
    resolver: textareaResolver,
  });
}

registerTextarea();
