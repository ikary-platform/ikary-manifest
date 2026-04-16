import { registerPrimitiveVersion } from '@ikary/cell-primitives';
import { KpiCluster } from './KpiCluster';
import { resolveKpiCluster } from './KpiCluster.resolver';

registerPrimitiveVersion(
  'kpi-cluster',
  '1.0.0',
  { component: KpiCluster, resolver: resolveKpiCluster },
  { source: 'custom', label: 'KPI Cluster', category: 'data' },
);
