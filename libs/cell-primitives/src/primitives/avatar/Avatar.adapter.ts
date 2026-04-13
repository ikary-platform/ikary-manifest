import type { AvatarPresentation } from '@ikary/cell-presentation';
import type { AvatarViewProps } from './Avatar.types';

export type BuildAvatarViewModelInput = {
  presentation: AvatarPresentation;
};

export function buildAvatarViewModel(input: BuildAvatarViewModelInput): AvatarViewProps {
  return {
    src: normalizeOptionalText(input.presentation.src),
    alt: normalizeOptionalText(input.presentation.alt),
    fallback: normalizeOptionalText(input.presentation.fallback),
    size: input.presentation.size,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
