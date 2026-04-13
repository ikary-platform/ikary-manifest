import type { BreadcrumbPresentation } from '@ikary/cell-presentation';
import type { BreadcrumbViewProps, BreadcrumbItemView } from './Breadcrumb.types';

export type BuildBreadcrumbViewModelInput = {
  presentation: BreadcrumbPresentation;
};

export function buildBreadcrumbViewModel(input: BuildBreadcrumbViewModelInput): BreadcrumbViewProps {
  return {
    items: input.presentation.items.map(
      (item): BreadcrumbItemView => ({
        label: item.label,
        href: normalizeOptionalText(item.href),
      }),
    ),
    separator: input.presentation.separator,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
