import { registerPrimitiveVersion } from '@ikary/cell-primitives';
import { TrendBreakdownSection } from './TrendBreakdownSection';
import { resolveTrendBreakdownSection } from './TrendBreakdownSection.resolver';

registerPrimitiveVersion(
  'trend-breakdown-section',
  '1.0.0',
  { component: TrendBreakdownSection, resolver: resolveTrendBreakdownSection },
  { source: 'custom', label: 'Trend Breakdown Section', category: 'layout' },
);
