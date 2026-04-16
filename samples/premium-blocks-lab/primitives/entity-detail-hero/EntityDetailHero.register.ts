import { registerPrimitiveVersion } from '@ikary/cell-primitives';
import { EntityDetailHero } from './EntityDetailHero';
import { resolveEntityDetailHero } from './EntityDetailHero.resolver';

registerPrimitiveVersion(
  'entity-detail-hero',
  '1.0.0',
  { component: EntityDetailHero, resolver: resolveEntityDetailHero },
  { source: 'custom', label: 'Entity Detail Hero', category: 'layout' },
);
