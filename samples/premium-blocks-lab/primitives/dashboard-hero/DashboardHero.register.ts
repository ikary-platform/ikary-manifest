import { registerPrimitiveVersion } from '@ikary/cell-primitives';
import { DashboardHero } from './DashboardHero';
import { resolveDashboardHero } from './DashboardHero.resolver';

registerPrimitiveVersion(
  'dashboard-hero',
  '1.0.0',
  { component: DashboardHero, resolver: resolveDashboardHero },
  { source: 'custom', label: 'Dashboard Hero', category: 'layout' },
);
