import type { ButtonPresentation } from '@ikary/cell-presentation';
import type { ButtonViewProps } from './Button.types';

export type BuildButtonViewModelInput = {
  presentation: ButtonPresentation;
  onClick?: () => void;
};

export function buildButtonViewModel(input: BuildButtonViewModelInput): ButtonViewProps {
  return {
    label: input.presentation.label,
    variant: input.presentation.variant,
    size: input.presentation.size,
    disabled: input.presentation.disabled ?? false,
    loading: input.presentation.loading ?? false,
    buttonType: input.presentation.buttonType,
    onClick: input.onClick,
  };
}
