import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Avatar } from './Avatar';
import { resolveAvatar, type AvatarResolverRuntime } from './Avatar.resolver';
import type { AvatarViewProps } from './Avatar.types';

const avatarResolver: PrimitiveResolver<unknown, AvatarViewProps, AvatarResolverRuntime> = (presentation, runtime) =>
  resolveAvatar(presentation, runtime);

export function registerAvatar(): void {
  registerPrimitive('avatar', { component: Avatar, resolver: avatarResolver });
}

registerAvatar();
