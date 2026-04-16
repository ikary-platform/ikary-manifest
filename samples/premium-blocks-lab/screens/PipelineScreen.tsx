import { useState } from 'react';
import { FilteredWorkspace } from '../primitives/filtered-workspace/FilteredWorkspace';
import { KpiCluster } from '../primitives/kpi-cluster/KpiCluster';

interface Opportunity {
  id: string;
  title: string;
  account: string;
  stage: 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed won' | 'Closed lost';
  amount: string;
  close: string;
  owner: string;
  tone: 'default' | 'positive' | 'warning' | 'danger';
}

const OPPS: Opportunity[] = [
  { id: '1', title: 'Montclair Renewal FY26', account: 'Montclair Industries', stage: 'Negotiation', amount: '$1.42M', close: 'Mar 14', owner: 'Pierre J.', tone: 'default' },
  { id: '2', title: 'Orbit Labs Tier Up', account: 'Orbit Labs', stage: 'Proposal', amount: '$212k', close: 'Feb 28', owner: 'Priya R.', tone: 'warning' },
  { id: '3', title: 'Sandstone Expansion', account: 'Sandstone Co', stage: 'Qualification', amount: '$88k', close: 'Apr 10', owner: 'Ava B.', tone: 'default' },
  { id: '4', title: 'NorthStar Pilot', account: 'NorthStar Media', stage: 'Negotiation', amount: '$640k', close: 'Mar 02', owner: 'Pierre J.', tone: 'positive' },
  { id: '5', title: 'Ikigai Platform Upgrade', account: 'Ikigai Health', stage: 'Proposal', amount: '$425k', close: 'Apr 18', owner: 'Marco V.', tone: 'default' },
];

export function PipelineScreen() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string | null>(null);

  const filtered = OPPS.filter((o) => {
    if (stageFilter && o.stage !== stageFilter) return false;
    if (search && !`${o.title} ${o.account}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const isEmpty = filtered.length === 0;
  const hasActiveFilters = Boolean(stageFilter) || Boolean(search);

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <KpiCluster
        title="Pipeline snapshot"
        columns="auto"
        kpis={[
          { label: 'Open value', value: '$2.78M', trend: { direction: 'up', value: '+6%' }, tone: 'default' },
          { label: 'Weighted forecast', value: '$1.44M', trend: { direction: 'up', value: '+4%' }, tone: 'default' },
          { label: 'Avg. cycle', value: '52d', trend: { direction: 'down', value: '−3d' }, tone: 'default' },
          { label: 'Win rate', value: '41%', trend: { direction: 'up', value: '+2pp' }, tone: 'default' },
        ]}
      />

      <FilteredWorkspace
        title="Pipeline"
        resultCount={filtered.length}
        isEmpty={isEmpty}
        isLoading={false}
        asidePosition="right"
        slots={{
          'toolbar-leading': (
            <>
              <div className="relative">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search accounts, opportunities…"
                  className="h-9 w-64 rounded-md border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <FilterChip
                label="Stage"
                active={Boolean(stageFilter)}
                value={stageFilter ?? 'Any'}
                onClick={() => setStageFilter(stageFilter === 'Negotiation' ? null : 'Negotiation')}
              />
              <FilterChip label="Owner" value="Any" onClick={() => {}} />
              <FilterChip label="Close" value="This quarter" onClick={() => {}} />
            </>
          ),
          'toolbar-trailing': (
            <>
              <button className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted">
                Saved views
              </button>
              <button className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90">
                + New opportunity
              </button>
            </>
          ),
          summary: hasActiveFilters ? (
            <>
              <span className="font-medium text-foreground">Filters applied:</span>
              {stageFilter ? <SummaryPill label={`Stage: ${stageFilter}`} onClear={() => setStageFilter(null)} /> : null}
              {search ? <SummaryPill label={`“${search}”`} onClear={() => setSearch('')} /> : null}
              <button className="text-xs font-medium text-primary hover:underline" onClick={() => { setStageFilter(null); setSearch(''); }}>
                Clear all
              </button>
            </>
          ) : (
            <span>Showing all open opportunities across the pod.</span>
          ),
          content: <PipelineTable opps={filtered} />,
          aside: (
            <>
              <h3 className="text-sm font-semibold text-foreground">Tips</h3>
              <p className="text-xs text-muted-foreground">
                Save a view after filtering to return to it in one click. Views are
                shared with your pod by default.
              </p>
              <div className="mt-2 flex flex-col gap-2">
                <SavedView name="My Q1 renewals" count={8} />
                <SavedView name="Strategic EMEA" count={14} />
                <SavedView name="Stalled > 30d" count={3} tone="warning" />
              </div>
            </>
          ),
          empty: (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
              <p className="text-sm font-semibold text-foreground">
                No opportunities match these filters
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try clearing the search or broadening the stage filter.
              </p>
              <button
                onClick={() => { setStageFilter(null); setSearch(''); }}
                className="mt-2 inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
              >
                Clear filters
              </button>
            </div>
          ),
        }}
      />
    </div>
  );
}

function FilterChip({ label, value, active = false, onClick }: { label: string; value: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-foreground hover:bg-muted',
      ].join(' ')}
    >
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
      <span aria-hidden className="text-xs opacity-60">▾</span>
    </button>
  );
}

function SummaryPill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
      {label}
      <button onClick={onClear} aria-label="Remove filter" className="ml-0.5 opacity-70 hover:opacity-100">
        ×
      </button>
    </span>
  );
}

function SavedView({ name, count, tone = 'default' }: { name: string; count: number; tone?: 'default' | 'warning' }) {
  return (
    <button className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
      <span className={tone === 'warning' ? 'text-amber-700 dark:text-amber-300' : 'text-foreground'}>{name}</span>
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
    </button>
  );
}

function PipelineTable({ opps }: { opps: Opportunity[] }) {
  if (opps.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Opportunity</th>
            <th className="px-3 py-2 text-left">Account</th>
            <th className="px-3 py-2 text-left">Stage</th>
            <th className="px-3 py-2 text-right">Amount</th>
            <th className="px-3 py-2 text-left">Close</th>
            <th className="px-3 py-2 text-left">Owner</th>
          </tr>
        </thead>
        <tbody>
          {opps.map((o, i) => (
            <tr key={o.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
              <td className="px-3 py-2 font-medium text-foreground">{o.title}</td>
              <td className="px-3 py-2 text-muted-foreground">{o.account}</td>
              <td className="px-3 py-2">
                <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs">
                  {o.stage}
                </span>
              </td>
              <td className="px-3 py-2 text-right font-medium">{o.amount}</td>
              <td className="px-3 py-2 text-muted-foreground">{o.close}</td>
              <td className="px-3 py-2 text-muted-foreground">{o.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
