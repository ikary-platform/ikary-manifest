import { DashboardHero } from '../primitives/dashboard-hero/DashboardHero';
import { KpiCluster } from '../primitives/kpi-cluster/KpiCluster';
import { TrendBreakdownSection } from '../primitives/trend-breakdown-section/TrendBreakdownSection';
import { TimelineAuditRail } from '../primitives/timeline-audit-rail/TimelineAuditRail';
import type { TimelineItem } from '../primitives/timeline-audit-rail/TimelineAuditRailPresentationSchema';
import { PipelineBars } from './chart-stubs/PipelineBars';
import { BreakdownList } from './chart-stubs/BreakdownList';

const TIMELINE_ITEMS: TimelineItem[] = [
  {
    id: '1',
    groupHeading: 'Today',
    timestamp: '14:32',
    title: 'Invoice #INV-4821 issued',
    description: 'Delivered to accounts@montclair.com.',
    actor: 'Alice Moreau',
    actorInitials: 'AM',
    tone: 'positive',
  },
  {
    id: '2',
    groupHeading: 'Today',
    timestamp: '11:12',
    title: 'Renewal probability updated',
    description: 'Orbit Labs moved from 60% to 38% after usage drop.',
    actor: 'Automation',
    tone: 'warning',
  },
  {
    id: '3',
    groupHeading: 'Yesterday',
    timestamp: '17:48',
    title: 'Three accounts moved to Proposal',
    actor: 'System',
    tone: 'info',
  },
];

export function DashboardScreen() {
  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <DashboardHero
        eyebrow="Revenue overview"
        title="Q4 pipeline, forecast, and realized revenue"
        subtitle="Track bookings, active renewals, and pipeline health across Enterprise North."
        tone="emphasis"
        meta={[
          { label: 'Period', value: 'Q4 2026' },
          { label: 'Owner', value: 'Pierre' },
          { label: 'Region', value: 'Enterprise North' },
          { label: 'Updated', value: '14 min ago' },
        ]}
        slots={{
          actions: (
            <>
              <button className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted">
                Export
              </button>
              <button className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90">
                Share report
              </button>
            </>
          ),
          secondary: (
            <>
              <SegmentChip label="Week" active={false} />
              <SegmentChip label="Month" active={false} />
              <SegmentChip label="Quarter" active />
              <SegmentChip label="Year" active={false} />
            </>
          ),
          aside: (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Forecast confidence
              </span>
              <span className="text-2xl font-semibold">78%</span>
              <span className="text-xs text-muted-foreground">
                Based on trailing 6-quarter conversion.
              </span>
            </div>
          ),
        }}
      />

      <KpiCluster
        title="This quarter"
        columns="auto"
        kpis={[
          {
            label: 'Bookings',
            value: '$4.82M',
            trend: { direction: 'up', value: '+12%', label: 'vs Q3' },
            tone: 'default',
          },
          {
            label: 'Net new ARR',
            value: '$1.14M',
            trend: { direction: 'up', value: '+8%' },
            tone: 'positive',
          },
          {
            label: 'Gross churn',
            value: '$312k',
            trend: { direction: 'down', value: '−3%' },
            tone: 'default',
          },
          {
            label: 'At-risk accounts',
            value: '9',
            helper: '2 renewals in the next 30 days',
            trend: { direction: 'up', value: '+2' },
            tone: 'warning',
          },
        ]}
        slots={{
          actions: (
            <button className="text-xs font-medium text-primary hover:underline">
              Open report →
            </button>
          ),
          footer: <span>As of 14:00 UTC · Data refreshes every 15 min</span>,
        }}
      />

      <TrendBreakdownSection
        title="Pipeline by stage"
        subtitle="Weighted by probability, trailing 4 weeks."
        breakdownPosition="right"
        density="default"
        slots={{
          aside: (
            <>
              <SegmentChip label="4W" active />
              <SegmentChip label="QTD" active={false} />
              <SegmentChip label="YTD" active={false} />
            </>
          ),
          chart: <PipelineBars />,
          breakdown: (
            <BreakdownList
              heading="Top stages"
              rows={[
                { label: 'Negotiation', value: '$1.82M', share: 0.38 },
                { label: 'Proposal', value: '$1.21M', share: 0.25 },
                { label: 'Qualification', value: '$864k', share: 0.18 },
                { label: 'Prospecting', value: '$612k', share: 0.13 },
                { label: 'Discovery', value: '$286k', share: 0.06 },
              ]}
            />
          ),
          footer: (
            <span>
              Weighted values include probability. Click a bar to open the
              stage-level report.
            </span>
          ),
        }}
      />

      <TimelineAuditRail
        items={TIMELINE_ITEMS}
        density="default"
        slots={{
          header: (
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
                <p className="text-xs text-muted-foreground">
                  Revenue-relevant events across the pod.
                </p>
              </div>
              <button className="text-xs font-medium text-primary hover:underline">
                View all →
              </button>
            </div>
          ),
          footer: <span>Synced 2 minutes ago</span>,
          itemTrailing: () => (
            <button
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
              aria-label="Open activity"
            >
              ›
            </button>
          ),
        }}
      />
    </div>
  );
}

function SegmentChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-muted-foreground hover:text-foreground',
      ].join(' ')}
    >
      {label}
    </span>
  );
}
