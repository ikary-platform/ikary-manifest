import type { EntityDefinition } from '@ikary/cell-contract';
import type { MockEntityStore } from '../../../api-explorer/MockEntityStore';
import { prettify } from './dashboardFormatters';

// ── Widget spec types ─────────────────────────────────────────────────────────

export type KpiSpec =
  | { kind: 'total'; entityKey: string; label: string }
  | { kind: 'state'; entityKey: string; label: string; fieldKey: string; stateValue: string }
  | { kind: 'sum'; entityKey: string; label: string; fieldKey: string; isCurrency: boolean };

export type BarSpec = { entityKey: string; label: string; fieldKey: string; values: string[]; isStatus: boolean };
export type PieSpec = { entityKey: string; label: string; fieldKey: string; values: string[] };

// ── Data aggregation helpers ──────────────────────────────────────────────────

export function getAllRecords(store: MockEntityStore): Record<string, unknown>[] {
  return (store.list({ pageSize: 10000 }).body as { data: Record<string, unknown>[] }).data;
}

export function groupByField(
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

export function sumField(records: Record<string, unknown>[], fieldKey: string): number {
  return records.reduce(
    (acc, r) => acc + (typeof r[fieldKey] === 'number' ? (r[fieldKey] as number) : 0),
    0,
  );
}

// ── Widget derivation (manifest-driven) ──────────────────────────────────────

export function deriveWidgets(entities: EntityDefinition[]): {
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
