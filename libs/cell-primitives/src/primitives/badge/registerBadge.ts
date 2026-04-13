import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Badge } from './Badge';
import { resolveBadge, type BadgeResolverRuntime } from './Badge.resolver';
import type { BadgeViewProps } from './Badge.types';

const badgeResolver: PrimitiveResolver<unknown, BadgeViewProps, BadgeResolverRuntime> = (presentation, runtime) =>
  resolveBadge(presentation, runtime);

export function registerBadge(): void {
  registerPrimitive('badge', { component: Badge, resolver: badgeResolver });
}

registerBadge();
