import { EntityDetailHero, EntityFact } from '../primitives/entity-detail-hero/EntityDetailHero';
import { KpiCluster } from '../primitives/kpi-cluster/KpiCluster';
import { TimelineAuditRail } from '../primitives/timeline-audit-rail/TimelineAuditRail';
import type { TimelineItem } from '../primitives/timeline-audit-rail/TimelineAuditRailPresentationSchema';

const AUDIT_ITEMS: TimelineItem[] = [
  {
    id: 'a1',
    groupHeading: 'Today',
    timestamp: '16:02',
    title: 'Usage score lifted to 84',
    description: 'Daily active seats +18% over the trailing 7 days.',
    actor: 'Automation',
    tone: 'positive',
  },
  {
    id: 'a2',
    groupHeading: 'Today',
    timestamp: '09:11',
    title: 'Renewal meeting scheduled',
    description: 'Mar 02, 14:00 CET with Pierre & Montclair procurement.',
    actor: 'Pierre J.',
    actorInitials: 'PJ',
    tone: 'info',
  },
  {
    id: 'a3',
    groupHeading: 'Last week',
    timestamp: 'Mon 10:42',
    title: 'Invoice #INV-4810 paid',
    actor: 'System',
    tone: 'default',
  },
];

export function AccountDetailScreen() {
  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <EntityDetailHero
        name="Montclair Industries"
        subtitle="Enterprise · Industrial manufacturing · 2,400 employees"
        avatarFallback="MI"
        status={{ label: 'Healthy', tone: 'positive' }}
        slots={{
          actions: (
            <>
              <button className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted">
                Log touchpoint
              </button>
              <button className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90">
                Start renewal
              </button>
            </>
          ),
          badges: (
            <>
              <Badge label="Enterprise" />
              <Badge label="EU" />
              <Badge label="Strategic account" tone="primary" />
              <Badge label="Renewal Q1" tone="warning" />
            </>
          ),
          facts: (
            <>
              <EntityFact label="ARR" value="$1.42M" />
              <EntityFact label="Owner" value="Pierre J." />
              <EntityFact label="Renewal date" value="Mar 14, 2026" />
              <EntityFact label="Region" value="EMEA" />
              <EntityFact label="Seats" value="480 / 500" />
              <EntityFact label="Contract" value="Annual, prepaid" />
            </>
          ),
          aside: (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Primary contact
              </span>
              <div className="text-sm font-medium">Sofia Bianchi</div>
              <div className="text-xs text-muted-foreground">
                Head of Procurement · sofia@montclair.com
              </div>
            </div>
          ),
        }}
      />

      <KpiCluster
        title="Health signals"
        columns="auto"
        kpis={[
          {
            label: 'Usage score',
            value: '84',
            trend: { direction: 'up', value: '+6', label: 'vs last week' },
            tone: 'positive',
          },
          {
            label: 'Active seats',
            value: '480',
            helper: 'of 500 provisioned',
            trend: { direction: 'up', value: '+24' }, tone: 'default'
          },
          {
            label: 'Support tickets',
            value: '3',
            helper: '1 open',
            trend: { direction: 'down', value: '−4' }, tone: 'default'
          },
          {
            label: 'NPS',
            value: '62',
            trend: { direction: 'neutral', value: '0' }, tone: 'default'
          },
        ]}
      />

      <TimelineAuditRail
        items={AUDIT_ITEMS}
        density="default"
        slots={{
          header: (
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-semibold text-foreground">Account activity</h3>
                <p className="text-xs text-muted-foreground">
                  Internal touchpoints, system events, and invoice changes.
                </p>
              </div>
              <button className="text-xs font-medium text-primary hover:underline">
                Open audit log →
              </button>
            </div>
          ),
        }}
      />
    </div>
  );
}

function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'primary' | 'warning' }) {
  const tones: Record<string, string> = {
    neutral: 'border-border bg-muted text-muted-foreground',
    primary: 'border-primary/30 bg-primary/10 text-primary',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  };
  return (
    <span
      className={[
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        tones[tone],
      ].join(' ')}
    >
      {label}
    </span>
  );
}
