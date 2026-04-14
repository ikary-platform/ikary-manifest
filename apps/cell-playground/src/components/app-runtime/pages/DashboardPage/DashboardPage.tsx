import { useMemo } from 'react';
import type { PageDefinition } from '@ikary/cell-contract';
import { useAppRuntime } from '../../AppRuntimeContext';
import { KpiCard } from './KpiCard';
import { BarChartWidget } from './BarChartWidget';
import { DonutChartWidget } from './DonutChartWidget';
import {
  deriveWidgets,
  getAllRecords,
  groupByField,
  sumField,
} from './dashboardModel';
import { formatNumber, formatCurrency, prettify } from './dashboardFormatters';
import { resolveColor, kpiAccent } from './dashboardColors';

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
  );
}

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
              <BarChartWidget key={i} title={spec.label} data={barData[i] ?? null} />
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
              <DonutChartWidget key={i} title={spec.label} data={pieData[i] ?? null} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
