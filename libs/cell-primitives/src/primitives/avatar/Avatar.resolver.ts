import { validateRuntimeAvatarPresentation } from '@ikary/cell-presentation';
import { buildAvatarViewModel, type BuildAvatarViewModelInput } from './Avatar.adapter';
import type { AvatarViewProps } from './Avatar.types';

export type AvatarResolverRuntime = Omit<BuildAvatarViewModelInput, 'presentation'>;

export function resolveAvatar(presentation: unknown, runtime: AvatarResolverRuntime = {}): AvatarViewProps {
  const parsed = validateRuntimeAvatarPresentation(presentation);
  if (!parsed.ok) {
    return {};
  }
  return buildAvatarViewModel({ presentation: parsed.value, ...runtime });
}
