import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Card } from './Card';
import { resolveCard, type CardResolverRuntime } from './Card.resolver';
import type { CardViewProps } from './Card.types';

const cardResolver: PrimitiveResolver<unknown, CardViewProps, CardResolverRuntime> = (presentation, runtime) =>
  resolveCard(presentation, runtime);

export function registerCard(): void {
  registerPrimitive('card', { component: Card, resolver: cardResolver });
}

registerCard();
