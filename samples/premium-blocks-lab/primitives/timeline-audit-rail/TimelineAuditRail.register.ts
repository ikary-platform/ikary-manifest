import { registerPrimitiveVersion } from '@ikary/cell-primitives';
import { TimelineAuditRail } from './TimelineAuditRail';
import { resolveTimelineAuditRail } from './TimelineAuditRail.resolver';

registerPrimitiveVersion(
  'timeline-audit-rail',
  '1.0.0',
  { component: TimelineAuditRail, resolver: resolveTimelineAuditRail },
  { source: 'custom', label: 'Timeline Audit Rail', category: 'data' },
);
