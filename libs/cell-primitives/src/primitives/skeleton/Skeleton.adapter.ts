import type { SkeletonPresentation } from '@ikary/cell-presentation';
import type { SkeletonViewProps } from './Skeleton.types';

export type BuildSkeletonViewModelInput = {
  presentation: SkeletonPresentation;
};

export function buildSkeletonViewModel(input: BuildSkeletonViewModelInput): SkeletonViewProps {
  return {
    count: input.presentation.count,
    heightClass: normalizeOptionalText(input.presentation.heightClass),
    widthClass: normalizeOptionalText(input.presentation.widthClass),
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
