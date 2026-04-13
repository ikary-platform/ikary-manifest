import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Breadcrumb } from './Breadcrumb';
import { resolveBreadcrumb, type BreadcrumbResolverRuntime } from './Breadcrumb.resolver';
import type { BreadcrumbViewProps } from './Breadcrumb.types';

const breadcrumbResolver: PrimitiveResolver<unknown, BreadcrumbViewProps, BreadcrumbResolverRuntime> = (
  presentation,
  runtime,
) => resolveBreadcrumb(presentation, runtime);

export function registerBreadcrumb(): void {
  registerPrimitive('breadcrumb', { component: Breadcrumb, resolver: breadcrumbResolver });
}

registerBreadcrumb();
