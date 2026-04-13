import type { BadgePresentation } from '@ikary/cell-presentation';
import type { BadgeViewProps } from './Badge.types';

export type BuildBadgeViewModelInput = {
  presentation: BadgePresentation;
};

export function buildBadgeViewModel(input: BuildBadgeViewModelInput): BadgeViewProps {
  return {
    label: input.presentation.label,
    variant: input.presentation.variant,
  };
}
