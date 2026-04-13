import { useMemo } from 'react';
import type { EntityDefinition, PageDefinition } from '@ikary/cell-contract';
import { useAppRuntime } from '../AppRuntimeContext';
import type { MockEntityStore } from '../../api-explorer/MockEntityStore';

// ── Semantic colors for lifecycle / status fields ─────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  // Green — completed / positive end-states
  active: '#22c55e',    approved: '#22c55e',   hired: '#22c55e',      paid: '#22c55e',
  completed: '#22c55e', done: '#22c55e',        resolved: '#22c55e',   closed: '#22c55e',
  won: '#22c55e',       success: '#22c55e',     customer: '#22c55e',   published: '#22c55e',
  // Amber — waiting / soft-blocked
  pending: '#f59e0b',   sent: '#f59e0b',        on_hold: '#f59e0b',    review: '#f59e0b',
  waiting: '#f59e0b',   triaged: '#f59e0b',     scheduled: '#f59e0b',  hold: '#f59e0b',
  // Blue — actively in-flight
  in_progress: '#3b82f6', interview: '#3b82f6', screening: '#3b82f6',
  assigned:    '#3b82f6', processing: '#3b82f6', contacted: '#3b82f6',
  // Slate — early / entry states
  draft: '#64748b', new: '#64748b', open: '#64748b', todo: '#64748b',
  created: '#64748b', lead: '#64748b', applied: '#64748b', initial: '#64748b',
  // Red — negative / terminal
  cancelled: '#ef4444', rejected: '#ef4444', churned: '#ef4444',
  lost:       '#ef4444', terminated: '#ef4444', failed: '#ef4444',
  inactive:   '#ef4444', wont_fix: '#ef4444',
  // Gray — archived / neutral terminal
  archived: '#6b7280', deprecated: '#6b7280', closed_lost: '#6b7280',
  // Purple — qualified / progressing
  qualified: '#8b5cf6', prospect: '#8b5cf6', proposal: '#8b5cf6', negotiation: '#8b5cf6',
  offer: '#8b5cf6',
  // Orange — leave / paused
  on_leave: '#f97316', paused: '#f97316',
};

const CHART_PALETTE = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
];

// ── Utility helpers ───────────────────────────────────────────────────────────

function resolveColor(value: string, index: number, isStatusField: boolean): string {
  if (isStatusField) {
    const v = value.toLowerCase();
    if (STATUS_COLORS[v]) return STATUS_COLORS[v]!;
    for (const [key, color] of Object.entries(STATUS_COLORS)) {
      if (v.includes(key)) return color;
    }
  }
  return CHART_PALETTE[index % CHART_PALETTE.length]!;
}

function prettify(s: string): string {
  return s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function kpiAccent(stateValue: string): 'default' | 'blue' | 'green' | 'amber' | 'red' {
  const v = stateValue.toLowerCase();
  if (/done|paid|complet|active|approv|hired|resolv|won|success|customer/.test(v)) return 'green';
  if (/hold|pending|sent|wait|review|triaged/.test(v)) return 'amber';
  if (/cancel|reject|lost|terminat|churn|inactive/.test(v)) return 'red';
  return 'blue';
}

// ── Widget spec types ─────────────────────────────────────────────────────────

type KpiSpec =
  | { kind: 'total'; entityKey: string; label: string }
  | { kind: 'state'; entityKey: string; label: string; fieldKey: string; stateValue: string }
  | { kind: 'sum'; entityKey: string; label: string; fieldKey: string; isCurrency: boolean };

type BarSpec = { entityKey: string; label: string; fieldKey: string; values: string[]; isStatus: boolean };
type PieSpec = { entityKey: string; label: string; fieldKey: string; values: string[] };

// ── Data aggregation helpers ──────────────────────────────────────────────────

function getAllRecords(store: MockEntityStore): Record<string, unknown>[] {
  return (store.list({ pageSize: 10000 }).body as { data: Record<string, unknown>[] }).data;
}

function groupByField(
  records: Record<string, unknown>[],
  fieldKey: string,
  declared: string[],
): { value: string; count: number }[] {
  const counts = new Map<string, number>(declared.map((v) => [v, 0]));
  for (const r of records) {
    const v = String(r[fieldKey] ?? '');
    if (counts.has(v)) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return declared.map((v) => ({ value: v, count: counts.get(v) ?? 0 }));
}

function sumField(records: Record<string, unknown>[], fieldKey: string): number {
  return records.reduce(
    (acc, r) => acc + (typeof r[fieldKey] === 'number' ? (r[fieldKey] as number) : 0),
    0,
  );
}

// ── Widget derivation (manifest-driven) ──────────────────────────────────────

function deriveWidgets(entities: EntityDefinition[]): {
  kpis: KpiSpec[];
  bars: BarSpec[];
  pies: PieSpec[];
} {
  const kpis: KpiSpec[] = [];
  const bars: BarSpec[] = [];
  const pies: PieSpec[] = [];

  for (const entity of entities) {
    // Always: total count KPI
    kpis.push({ kind: 'total', entityKey: entity.key, label: entity.pluralName ?? entity.name });

    const lcField = entity.lifecycle?.field;

    // Lifecycle → bar chart + up to 2 in-flight state KPIs
    if (entity.lifecycle) {
      const lc = entity.lifecycle;
      bars.push({
        entityKey: entity.key,
        label: `${entity.name} by ${prettify(lc.field)}`,
        fieldKey: lc.field,
        values: lc.states,
        isStatus: true,
      });

      const inFlight = lc.states.filter(
        (s) => s !== lc.initial && lc.transitions.some((t) => t.from === s),
      );
      for (const state of inFlight.slice(0, 2)) {
        kpis.push({
          kind: 'state',
          entityKey: entity.key,
          label: `${prettify(state)} ${entity.name}s`,
          fieldKey: lc.field,
          stateValue: state,
        });
      }
    }

    // Filterable enum fields (excluding lifecycle field)
    const enumFields = entity.fields.filter(
      (f) => f.type === 'enum' && f.key !== lcField && f.list?.filterable,
    );
    for (let i = 0; i < enumFields.length; i++) {
      const f = enumFields[i]!;
      const values = f.enumValues;
      if (!values?.length) continue;
      if (!entity.lifecycle && i === 0) {
        // No lifecycle — first filterable enum → bar chart
        bars.push({
          entityKey: entity.key,
          label: `${entity.name} by ${f.name ?? prettify(f.key)}`,
          fieldKey: f.key,
          values,
          isStatus: f.key === 'status',
        });
      } else {
        // All others → pie/donut
        pies.push({
          entityKey: entity.key,
          label: `${entity.name}: ${f.name ?? prettify(f.key)}`,
          fieldKey: f.key,
          values,
        });
      }
    }

    // First currency-like number field → sum KPI
    const currencyField = entity.fields.find(
      (f) => f.type === 'number' && /amount|subtotal|total|revenue|budget|price|cost|salary|wage/i.test(f.key),
    );
    if (currencyField) {
      kpis.push({
        kind: 'sum',
        entityKey: entity.key,
        label: currencyField.name ?? prettify(currencyField.key),
        fieldKey: currencyField.key,
        isCurrency: !/rating|score|probability|points|percent/i.test(currencyField.key),
      });
    }
  }

  return {
    kpis:  kpis.slice(0, 6),
    bars:  bars.slice(0, 4),
    pies:  pies.slice(0, 4),
  };
}

// ── Native status-bar chart (Recharts vertical layout doesn't show labels reliably) ──

function StatusBars({ data }: { data: { label: string; count: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="px-4 py-3 space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 truncate text-right leading-none">
            {d.label}
          </span>
          <div className="flex-1 h-5 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {d.count > 0 && (
              <div
                className="h-full rounded transition-all duration-300"
                style={{ width: `${(d.count / max) * 100}%`, backgroundColor: d.color }}
              />
            )}
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-6 shrink-0 text-right tabular-nums">
            {d.count}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Native SVG donut chart (Recharts PieChart has container-sizing issues) ───

function DonutChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <EmptyChart />;

  const cx = 60, cy = 60, ro = 54, ri = 32;
  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const sweep = (d.count / total) * 2 * Math.PI;
    const a1 = angle, a2 = angle + sweep;
    angle = a2;
    const large = sweep > Math.PI ? 1 : 0;
    const path =
      `M ${cx + ro * Math.cos(a1)} ${cy + ro * Math.sin(a1)}` +
      ` A ${ro} ${ro} 0 ${large} 1 ${cx + ro * Math.cos(a2)} ${cy + ro * Math.sin(a2)}` +
      ` L ${cx + ri * Math.cos(a2)} ${cy + ri * Math.sin(a2)}` +
      ` A ${ri} ${ri} 0 ${large} 0 ${cx + ri * Math.cos(a1)} ${cy + ri * Math.sin(a1)} Z`;
    return { ...d, path };
  });

  return (
    <div className="px-4 pb-4 flex flex-col items-center gap-3">
      <svg width={120} height={120} viewBox="0 0 120 120">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} />
        ))}
        <text x={cx} y={cy - 7} textAnchor="middle" style={{ fontSize: '17px', fontWeight: 700, fill: '#111827' }}>
          {total}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" style={{ fontSize: '9px', fill: '#9ca3af' }}>
          total
        </text>
      </svg>
      <div className="w-full space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">{d.label}</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0 tabular-nums">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  subtitle,
  accent = 'default',
}: {
  title: string;
  value: string;
  subtitle?: string;
  accent?: 'default' | 'blue' | 'green' | 'amber' | 'red';
}) {
  const accentColor = {
    default: 'text-gray-900 dark:text-gray-100',
    blue:    'text-blue-600 dark:text-blue-400',
    green:   'text-green-600 dark:text-green-400',
    amber:   'text-amber-600 dark:text-amber-400',
    red:     'text-red-600 dark:text-red-400',
  }[accent];

  // Scale font down for long values so they never overflow the card
  const valueSize =
    value.length <= 4 ? 'text-2xl' :
    value.length <= 7 ? 'text-xl' :
    value.length <= 10 ? 'text-lg' : 'text-base';

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-4 min-w-0 overflow-hidden">
      <p className={`${valueSize} font-bold leading-none truncate ${accentColor}`} title={value}>{value}</p>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5 leading-tight">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 pt-4 pb-0">{title}</p>
      {children}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
  );
}

function EmptyChart() {
  return (
    <div className="h-24 flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
      No data
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardPage({ page }: { page: PageDefinition }) {
  const { manifest, stores } = useAppRuntime();
  const entities = manifest.spec.entities ?? [];

  const { kpis, bars, pies } = useMemo(() => deriveWidgets(entities), [entities]);

  // KPI computed values
  const kpiValues = useMemo(
    () =>
      kpis.map((spec) => {
        const store = stores.get(spec.entityKey);
        if (!store) return { value: '—', subtitle: undefined, accent: 'default' as const };
        const records = getAllRecords(store);

        if (spec.kind === 'total') {
          return { value: formatNumber(records.length), subtitle: undefined, accent: 'default' as const };
        }
        if (spec.kind === 'state') {
          const count = records.filter((r) => r[spec.fieldKey] === spec.stateValue).length;
          return {
            value: formatNumber(count),
            subtitle: `of ${records.length} total`,
            accent: kpiAccent(spec.stateValue),
          };
        }
        // kind === 'sum'
        const total = sumField(records, spec.fieldKey);
        return {
          value: spec.isCurrency ? formatCurrency(total) : formatNumber(total),
          subtitle: undefined,
          accent: 'blue' as const,
        };
      }),
    [kpis, stores],
  );

  // Bar data — per-bar labeled + semantically colored rows
  const barData = useMemo(
    () =>
      bars.map((spec) => {
        const store = stores.get(spec.entityKey);
        if (!store) return null;
        const records = getAllRecords(store);
        const groups = groupByField(records, spec.fieldKey, spec.values);
        return groups.map((g, i) => ({
          label: prettify(g.value),
          count: g.count,
          color: resolveColor(g.value, i, spec.isStatus),
        }));
      }),
    [bars, stores],
  );

  // Donut data — per-slice colored slices
  const pieData = useMemo(
    () =>
      pies.map((spec) => {
        const store = stores.get(spec.entityKey);
        if (!store) return null;
        const records = getAllRecords(store);
        const groups = groupByField(records, spec.fieldKey, spec.values);
        return groups
          .filter((g) => g.count > 0)
          .map((g, i) => ({
            label: prettify(g.value),
            count: g.count,
            color: resolveColor(g.value, i, false),
          }));
      }),
    [pies, stores],
  );

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full">

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{page.title}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {manifest.metadata.description ?? 'Welcome to your application preview.'}
        </p>
      </div>

      {/* KPI cards */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((spec, i) => (
            <KpiCard
              key={i}
              title={spec.label}
              value={kpiValues[i]!.value}
              subtitle={kpiValues[i]!.subtitle}
              accent={kpiValues[i]!.accent}
            />
          ))}
        </div>
      )}

      {/* Status distribution — labeled bar rows */}
      {bars.length > 0 && (
        <div className="space-y-3">
          <SectionLabel label="Status Distribution" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bars.map((spec, i) => (
              <ChartCard key={i} title={spec.label}>
                {barData[i] ? <StatusBars data={barData[i]!} /> : <EmptyChart />}
              </ChartCard>
            ))}
          </div>
        </div>
      )}

      {/* Breakdowns — donut charts */}
      {pies.length > 0 && (
        <div className="space-y-3">
          <SectionLabel label="Breakdowns" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pies.map((spec, i) => (
              <ChartCard key={i} title={spec.label}>
                {pieData[i] && pieData[i]!.length > 0 ? (
                  <DonutChart data={pieData[i]!} />
                ) : (
                  <EmptyChart />
                )}
              </ChartCard>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
