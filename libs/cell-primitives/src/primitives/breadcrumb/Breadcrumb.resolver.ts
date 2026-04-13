import { validateRuntimeBreadcrumbPresentation } from '@ikary/cell-presentation';
import { buildBreadcrumbViewModel, type BuildBreadcrumbViewModelInput } from './Breadcrumb.adapter';
import type { BreadcrumbViewProps } from './Breadcrumb.types';

export type BreadcrumbResolverRuntime = Omit<BuildBreadcrumbViewModelInput, 'presentation'>;

export function resolveBreadcrumb(presentation: unknown, runtime: BreadcrumbResolverRuntime = {}): BreadcrumbViewProps {
  const parsed = validateRuntimeBreadcrumbPresentation(presentation);
  if (!parsed.ok) {
    return { items: [] };
  }
  return buildBreadcrumbViewModel({ presentation: parsed.value, ...runtime });
}
