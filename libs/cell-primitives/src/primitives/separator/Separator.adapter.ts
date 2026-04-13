import type { SeparatorPresentation } from '@ikary/cell-presentation';
import type { SeparatorViewProps } from './Separator.types';

export type BuildSeparatorViewModelInput = {
  presentation: SeparatorPresentation;
};

export function buildSeparatorViewModel(input: BuildSeparatorViewModelInput): SeparatorViewProps {
  return {
    orientation: input.presentation.orientation,
    decorative: input.presentation.decorative,
  };
}
