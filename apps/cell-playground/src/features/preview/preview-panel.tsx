import { useMemo, useState, useLayoutEffect, useRef } from 'react';
import { CellAppRenderer } from '@ikary/cell-runtime';
import type { ResolvedCreateField } from '@ikary/cell-engine';
import type {
  CellManifestV1,
  ValidationError,
  FieldDefinition,
  FieldRuleDefinition,
  RelationDefinition,
  ComputedFieldDefinition,
  LifecycleDefinition,
  EventDefinition,
  CapabilityDefinition,
  EntityPoliciesDefinition,
  FieldPoliciesDefinition,
} from '@ikary/cell-contract-core';
import type { BuilderMode } from '../compiler/use-builder-state';
import { Badge } from '../../components/ui/badge';
import { deriveManifestPreviewData } from '../shared/manifest-preview-data';
import type { ManifestPreviewData, ManifestPreviewEntity } from '../shared/manifest-preview-data';

// ── Shared rule helpers ────────────────────────────────────────────────────────

const RULE_COLORS: Record<string, string> = {
  required: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700',
  min_length: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  max_length:
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-700',
  regex:
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-700',
  email: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-700',
  number_min: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700',
  number_max:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700',
  date: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700',
  future_date:
    'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700',
  enum: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700',
};

function ruleColor(type: string): string {
  return (
    RULE_COLORS[type] ??
    'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
  );
}

function ruleLabel(rule: FieldRuleDefinition): string {
  switch (rule.type) {
    case 'min_length':
      return `min ${rule.params?.min ?? '?'} chars`;
    case 'max_length':
      return `max ${rule.params?.max ?? '?'} chars`;
    case 'number_min':
      return `≥ ${rule.params?.min ?? rule.params?.minExclusive ?? '?'}`;
    case 'number_max':
      return `≤ ${rule.params?.max ?? '?'}`;
    case 'regex':
      return `/${rule.params?.pattern ?? '?'}/`;
    case 'future_date':
      return 'future date';
    default:
      return rule.type.replace(/_/g, ' ');
  }
}

// ── Shared: rule list inside a field card ─────────────────────────────────────

function FieldRuleList({
  rules,
  translations,
}: {
  rules: FieldRuleDefinition[];
  translations: Record<string, string>;
}) {
  if (rules.length === 0) return null;
  return (
    <div className="pt-1.5 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
      {rules.map((rule) => (
        <div key={rule.ruleId} className="flex items-start gap-2">
          <Badge
            variant="outline"
            className={`shrink-0 text-[10px] font-medium leading-none px-1.5 py-0.5 mt-0.5 ${ruleColor(rule.type)}`}
          >
            {ruleLabel(rule)}
          </Badge>
          <div className="min-w-0">
            {/* Key is the source of truth — shown as primary */}
            <p
              className="text-[10px] font-mono text-gray-700 dark:text-gray-200 leading-tight truncate"
              title={rule.messageKey}
            >
              {rule.messageKey}
            </p>
            {/* Translation is secondary */}
            <p className="text-[9px] text-gray-400 dark:text-gray-500 italic mt-0.5 leading-tight">
              {translations[rule.messageKey] ?? rule.defaultMessage}
            </p>
            <div className="flex gap-2 mt-0.5">
              <span className="text-[9px] text-gray-400">{rule.blocking ? 'blocking' : 'warning'}</span>
              <span className="text-[9px] text-gray-400">{rule.clientSafe ? 'client' : 'server only 🔒'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Relation Diagram ──────────────────────────────────────────────────────────

interface DiagramEntityDef {
  key: string;
  name: string;
  isStub: boolean;
  col: number;
  row: number;
  fields: Array<{ key: string; isFK: boolean; isPK: boolean; label: string }>;
}

interface ConnectorDef {
  sourceEntityKey: string;
  sourceFieldKey: string;
  targetEntityKey: string;
  targetFieldKey: string;
  relationType: RelationDefinition['relation'];
}

function buildDiagramData(entity: ManifestPreviewEntity): { entities: DiagramEntityDef[]; connectors: ConnectorDef[] } {
  const relations = entity.relations ?? [];
  const entityMap = new Map<string, DiagramEntityDef>();
  const connectors: ConnectorDef[] = [];

  // FK keys that belong_to / self produce on the primary entity
  const fkKeys = new Set<string>();
  for (const rel of relations) {
    if (rel.relation === 'belongs_to' || rel.relation === 'self') {
      fkKeys.add(rel.key);
    }
  }

  // Primary entity fields (show id + FK keys only, keep it compact)
  const primaryFields: DiagramEntityDef['fields'] = [
    { key: 'id', isFK: false, isPK: true, label: 'id' },
    ...entity.fields
      .filter((f) => fkKeys.has(f.key) || (f.list?.visible && !f.system))
      .slice(0, 4)
      .map((f) => ({ key: f.key, isFK: fkKeys.has(f.key), isPK: false, label: f.key })),
  ];
  // Also add virtual FK fields for polymorphic
  const hasPolymorphic = relations.some((r) => r.relation === 'polymorphic');
  if (hasPolymorphic) {
    primaryFields.push({ key: 'target_id', isFK: true, isPK: false, label: 'target_id' });
    primaryFields.push({ key: 'target_type', isFK: false, isPK: false, label: 'target_type' });
  }

  const primaryEntity: DiagramEntityDef = {
    key: entity.key,
    name: entity.name,
    isStub: false,
    col: 0,
    row: 0,
    fields: primaryFields,
  };
  entityMap.set(entity.key, primaryEntity);

  let rightRow = 0;
  let centerRow = 0;

  for (const rel of relations) {
    if (rel.relation === 'belongs_to') {
      const targetKey = rel.entity;
      if (!entityMap.has(targetKey)) {
        entityMap.set(targetKey, {
          key: targetKey,
          name: targetKey,
          isStub: true,
          col: 2,
          row: rightRow++,
          fields: [{ key: 'id', isFK: false, isPK: true, label: 'id' }],
        });
      }
      connectors.push({
        sourceEntityKey: entity.key,
        sourceFieldKey: rel.key,
        targetEntityKey: targetKey,
        targetFieldKey: 'id',
        relationType: 'belongs_to',
      });
    } else if (rel.relation === 'has_many') {
      const targetKey = rel.entity;
      if (!entityMap.has(targetKey)) {
        entityMap.set(targetKey, {
          key: targetKey,
          name: targetKey,
          isStub: true,
          col: 2,
          row: rightRow++,
          fields: [
            { key: 'id', isFK: false, isPK: true, label: 'id' },
            { key: rel.foreignKey, isFK: true, isPK: false, label: rel.foreignKey },
          ],
        });
      }
      connectors.push({
        sourceEntityKey: entity.key,
        sourceFieldKey: 'id',
        targetEntityKey: targetKey,
        targetFieldKey: rel.foreignKey,
        relationType: 'has_many',
      });
    } else if (rel.relation === 'many_to_many') {
      const throughKey = rel.through;
      if (!entityMap.has(throughKey)) {
        entityMap.set(throughKey, {
          key: throughKey,
          name: throughKey,
          isStub: true,
          col: 1,
          row: centerRow++,
          fields: [
            { key: 'id', isFK: false, isPK: true, label: 'id' },
            { key: rel.sourceKey, isFK: true, isPK: false, label: rel.sourceKey },
            { key: rel.targetKey, isFK: true, isPK: false, label: rel.targetKey },
          ],
        });
      }
      connectors.push({
        sourceEntityKey: entity.key,
        sourceFieldKey: 'id',
        targetEntityKey: throughKey,
        targetFieldKey: rel.sourceKey,
        relationType: 'many_to_many',
      });
    } else if (rel.relation === 'self') {
      // self loop — connector from primary entity FK to its own id
      connectors.push({
        sourceEntityKey: entity.key,
        sourceFieldKey: rel.key,
        targetEntityKey: entity.key,
        targetFieldKey: 'id',
        relationType: 'self',
      });
    } else if (rel.relation === 'polymorphic') {
      const stubKey = '__any__';
      if (!entityMap.has(stubKey)) {
        entityMap.set(stubKey, {
          key: stubKey,
          name: 'Any Entity',
          isStub: true,
          col: 2,
          row: rightRow++,
          fields: [{ key: 'id', isFK: false, isPK: true, label: 'id' }],
        });
      }
      connectors.push({
        sourceEntityKey: entity.key,
        sourceFieldKey: 'target_id',
        targetEntityKey: stubKey,
        targetFieldKey: 'id',
        relationType: 'polymorphic',
      });
    }
  }

  return { entities: Array.from(entityMap.values()), connectors };
}

interface FieldRowRef {
  entityKey: string;
  fieldKey: string;
  el: HTMLDivElement | null;
}

const RELATION_COLORS: Record<RelationDefinition['relation'], string> = {
  belongs_to: '#3b82f6',
  has_many: '#8b5cf6',
  many_to_many: '#10b981',
  self: '#f59e0b',
  polymorphic: '#6b7280',
};

function EntityCard({ def, fieldRefs }: { def: DiagramEntityDef; fieldRefs: React.MutableRefObject<FieldRowRef[]> }) {
  return (
    <div
      className={`rounded-lg border text-xs overflow-hidden shadow-sm ${def.isStub ? 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
      style={{ minWidth: 140 }}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 border-b ${def.isStub ? 'border-dashed border-gray-200 dark:border-gray-600 bg-gray-100/60 dark:bg-gray-700/30' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750'}`}
      >
        <span className="text-[9px] text-gray-400">▦</span>
        <span
          className={`font-semibold ${def.isStub ? 'text-gray-500 dark:text-gray-400 italic' : 'text-gray-700 dark:text-gray-200'}`}
        >
          {def.name}
        </span>
        {def.isStub && <span className="text-[8px] text-gray-400 ml-auto">stub</span>}
      </div>
      {/* Fields */}
      {def.fields.map((f) => (
        <div
          key={f.key}
          ref={(el) => {
            // register ref
            const existing = fieldRefs.current.find((r) => r.entityKey === def.key && r.fieldKey === f.key);
            if (existing) {
              existing.el = el;
            } else {
              fieldRefs.current.push({ entityKey: def.key, fieldKey: f.key, el });
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 border-b last:border-0 border-gray-50 dark:border-gray-700/50 ${f.isFK ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
        >
          {f.isPK && (
            <span className="text-[9px]" title="primary key">
              🔑
            </span>
          )}
          {f.isFK && !f.isPK && (
            <span className="text-[9px]" title="foreign key">
              🔗
            </span>
          )}
          {!f.isPK && !f.isFK && <span className="w-[13px]" />}
          <code
            className={`text-[10px] font-mono leading-tight ${f.isPK ? 'text-gray-400 dark:text-gray-500' : f.isFK ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            {f.label}
          </code>
        </div>
      ))}
    </div>
  );
}

interface SvgConnector {
  d: string;
  color: string;
  dashed: boolean;
  relationType: RelationDefinition['relation'];
}

function RelationDiagram({ entity }: { entity: ManifestPreviewEntity }) {
  const { entities, connectors } = buildDiagramData(entity);
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<FieldRowRef[]>([]);
  const [svgLines, setSvgLines] = useState<SvgConnector[]>([]);

  // Group entities by col
  const byCol = new Map<number, DiagramEntityDef[]>();
  for (const e of entities) {
    const arr = byCol.get(e.col) ?? [];
    arr.push(e);
    byCol.set(e.col, arr);
  }

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const lines: SvgConnector[] = [];

    for (const conn of connectors) {
      if (conn.relationType === 'self') {
        // Find the FK field row on the primary entity
        const fkRef = fieldRefs.current.find(
          (r) => r.entityKey === conn.sourceEntityKey && r.fieldKey === conn.sourceFieldKey,
        );
        const pkRef = fieldRefs.current.find(
          (r) => r.entityKey === conn.targetEntityKey && r.fieldKey === conn.targetFieldKey,
        );
        if (!fkRef?.el || !pkRef?.el) continue;
        const fkRect = fkRef.el.getBoundingClientRect();
        const pkRect = pkRef.el.getBoundingClientRect();
        const x1 = fkRect.left - containerRect.left;
        const y1 = fkRect.top - containerRect.top + fkRect.height / 2;
        const x2 = pkRect.left - containerRect.left;
        const y2 = pkRect.top - containerRect.top + pkRect.height / 2;
        // Loop to the left
        const loopX = x1 - 40;
        lines.push({
          d: `M ${x1} ${y1} C ${loopX} ${y1}, ${loopX} ${y2}, ${x2} ${y2}`,
          color: RELATION_COLORS['self'],
          dashed: false,
          relationType: 'self',
        });
        continue;
      }

      const srcRef = fieldRefs.current.find(
        (r) => r.entityKey === conn.sourceEntityKey && r.fieldKey === conn.sourceFieldKey,
      );
      const tgtRef = fieldRefs.current.find(
        (r) => r.entityKey === conn.targetEntityKey && r.fieldKey === conn.targetFieldKey,
      );
      if (!srcRef?.el || !tgtRef?.el) continue;

      const srcRect = srcRef.el.getBoundingClientRect();
      const tgtRect = tgtRef.el.getBoundingClientRect();

      const x1 = srcRect.right - containerRect.left;
      const y1 = srcRect.top - containerRect.top + srcRect.height / 2;
      const x2 = tgtRect.left - containerRect.left;
      const y2 = tgtRect.top - containerRect.top + tgtRect.height / 2;
      const cx = (x1 + x2) / 2;

      lines.push({
        d: `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`,
        color: RELATION_COLORS[conn.relationType],
        dashed: conn.relationType === 'has_many' || conn.relationType === 'polymorphic',
        relationType: conn.relationType,
      });
    }

    setSvgLines((prev) => {
      const prevStr = JSON.stringify(prev);
      const nextStr = JSON.stringify(lines);
      return prevStr === nextStr ? prev : lines;
    });
  });

  const cols = Array.from(byCol.keys()).sort();

  return (
    <div className="p-4 space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(Object.entries(RELATION_COLORS) as [RelationDefinition['relation'], string][]).map(([type, color]) => {
          const dashed = type === 'has_many' || type === 'polymorphic';
          return (
            <div key={type} className="flex items-center gap-1.5">
              <svg width="16" height="4" viewBox="0 0 16 4">
                <line
                  x1="0"
                  y1="2"
                  x2="16"
                  y2="2"
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray={dashed ? '3 2' : undefined}
                />
              </svg>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">{type.replace(/_/g, ' ')}</span>
            </div>
          );
        })}
      </div>

      {/* Diagram */}
      <div ref={containerRef} className="relative flex gap-12 items-start">
        {/* SVG overlay for connectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 10 }}>
          {svgLines.map((line, i) => (
            <g key={i}>
              <path
                d={line.d}
                fill="none"
                stroke={line.color}
                strokeWidth={1.5}
                strokeDasharray={line.dashed ? '4 3' : undefined}
                opacity={0.8}
              />
              {/* Arrow endpoint dots */}
              <circle r={3} fill={line.color} opacity={0.8}>
                <animateMotion dur="0s" fill="freeze" path={line.d} keyPoints="1" keyTimes="1" calcMode="linear" />
              </circle>
            </g>
          ))}
        </svg>

        {cols.map((col) => (
          <div key={col} className="flex flex-col gap-4" style={{ zIndex: 1 }}>
            {(byCol.get(col) ?? []).map((def) => (
              <EntityCard key={def.key} def={def} fieldRefs={fieldRefs} />
            ))}
          </div>
        ))}
      </div>

      {/* Relation summary */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          {entity.relations.length} relation{entity.relations.length !== 1 ? 's' : ''}
        </p>
        {entity.relations.map((rel) => (
          <div key={rel.key} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: RELATION_COLORS[rel.relation] }}
            />
            <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400">{rel.key}</code>
            <Badge variant="outline" className="text-[9px] px-1 py-0 leading-none">
              {rel.relation.replace('_', ' ')}
            </Badge>
            {'entity' in rel && <span className="text-[10px] text-gray-400">→ {rel.entity}</span>}
            {'through' in rel && <span className="text-[10px] text-gray-400">→ {rel.through}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Computed field viewer ──────────────────────────────────────────────────────

const FORMULA_BADGE_COLORS: Record<string, string> = {
  expression: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  aggregation:
    'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
  conditional:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700',
};

function ComputedFieldViewer({ computed }: { computed: ComputedFieldDefinition[] }) {
  if (computed.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-400">No computed fields defined.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {computed.map((cf) => (
        <div
          key={cf.key}
          className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden"
        >
          {/* Header row */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/60">
            <code className="text-[11px] font-mono font-semibold text-gray-700 dark:text-gray-300">{cf.key}</code>
            <span className="text-xs text-gray-500 dark:text-gray-400">{cf.name}</span>
            <Badge variant="outline" className="ml-auto text-[9px] font-mono px-1.5 py-0 leading-none">
              {cf.type}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[9px] font-medium px-1.5 py-0.5 leading-none ${FORMULA_BADGE_COLORS[cf.formulaType] ?? ''}`}
            >
              {cf.formulaType}
            </Badge>
          </div>

          {/* Body */}
          <div className="px-3 py-2 space-y-1.5">
            {cf.formulaType === 'aggregation' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono px-1.5 py-0.5 leading-none text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                >
                  {cf.operation}
                  {cf.field ? `(${cf.field})` : ''}
                </Badge>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">from</span>
                <code className="text-[10px] font-mono text-gray-700 dark:text-gray-300">{cf.relation}</code>
                {cf.filter && (
                  <>
                    <span className="text-[10px] text-gray-400">where</span>
                    <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400">{cf.filter}</code>
                  </>
                )}
              </div>
            ) : cf.formulaType === 'conditional' ? (
              <div className="space-y-0.5">
                <code className="text-[10px] font-mono text-gray-700 dark:text-gray-300 block break-all">
                  {cf.condition}
                </code>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  then <code className="font-mono">{cf.then}</code> else <code className="font-mono">{cf.else}</code>
                </div>
              </div>
            ) : (
              <code className="text-[10px] font-mono text-gray-700 dark:text-gray-300 block break-all">
                {cf.expression}
              </code>
            )}

            {cf.dependencies && cf.dependencies.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[9px] uppercase tracking-widest text-gray-400 shrink-0">deps</span>
                {cf.dependencies.map((d) => (
                  <Badge
                    key={d}
                    variant="outline"
                    className="text-[9px] font-mono px-1 py-0 leading-none text-gray-500 dark:text-gray-400"
                  >
                    {d}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Lifecycle viewer ───────────────────────────────────────────────────────────

const STATE_PALETTE = [
  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
];

function LifecycleViewer({ lifecycle }: { lifecycle: LifecycleDefinition }) {
  const stateColorMap = new Map(lifecycle.states.map((s, i) => [s, STATE_PALETTE[i % STATE_PALETTE.length]]));

  return (
    <div className="p-4 space-y-5">
      {/* States bar */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          States ·{' '}
          <span className="normal-case">
            initial: <code className="font-mono">{lifecycle.initial}</code>
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {lifecycle.states.map((state) => (
            <div key={state} className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${stateColorMap.get(state) ?? STATE_PALETTE[0]}`}
              >
                {state === lifecycle.initial && <span className="text-[8px]">●</span>}
                {state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transitions */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          Transitions ({lifecycle.transitions.length})
        </p>
        <div className="space-y-3">
          {lifecycle.transitions.map((t) => (
            <div
              key={t.key}
              className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/60 flex-wrap">
                <code className="text-[11px] font-mono font-semibold text-gray-700 dark:text-gray-300">{t.key}</code>
                {t.label && <span className="text-[10px] text-gray-500 dark:text-gray-400 italic">{t.label}</span>}
                <div className="flex items-center gap-1 ml-auto">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${stateColorMap.get(t.from) ?? STATE_PALETTE[0]}`}
                  >
                    {t.from}
                  </span>
                  <span className="text-gray-400 text-[10px]">→</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${stateColorMap.get(t.to) ?? STATE_PALETTE[0]}`}
                  >
                    {t.to}
                  </span>
                </div>
              </div>

              {/* Guards */}
              {t.guards && t.guards.length > 0 && (
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 space-y-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      Guards
                    </span>
                  </div>
                  {t.guards.map((g, i) => (
                    <code
                      key={i}
                      className="block text-[10px] font-mono text-gray-700 dark:text-gray-300 bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 rounded"
                    >
                      {g}
                    </code>
                  ))}
                </div>
              )}

              {/* Hooks */}
              {t.hooks && t.hooks.length > 0 && (
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[9px] uppercase tracking-widest text-purple-600 dark:text-purple-400">
                      Hooks
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.hooks.map((h) => (
                      <Badge
                        key={h}
                        variant="outline"
                        className="text-[10px] font-mono px-1.5 py-0.5 leading-none text-purple-700 border-purple-200 dark:text-purple-300 dark:border-purple-700"
                      >
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Event */}
              {t.event && (
                <div className="px-3 py-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 mr-2">Event</span>
                  <code className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{t.event}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Events viewer ─────────────────────────────────────────────────────────────

function EventsViewer({ entity }: { entity: ManifestPreviewEntity }) {
  const events = entity.events as EventDefinition | undefined;
  const entityKey = entity.key;
  const transitions = entity.lifecycle?.transitions ?? [];
  const relations = entity.relations ?? [];
  const [envelopeExpanded, setEnvelopeExpanded] = useState(false);

  const createdName = events?.names?.created ?? `entity.${entityKey}.created`;
  const updatedName = events?.names?.updated ?? `entity.${entityKey}.updated`;
  const deletedName = events?.names?.deleted ?? `entity.${entityKey}.deleted`;

  const sampleEnvelope = {
    event_id: 'evt_01jxxxxxxxxxxxxxx',
    event_name: createdName,
    version: 1,
    timestamp: new Date().toISOString(),
    tenant_id: 'ten_xxxxxxxxxxxxxxxx',
    workspace_id: 'ws_xxxxxxxxxxxxxxxx',
    cell_id: 'cell_xxxxxxxxxxxxxxxx',
    actor: { type: 'user', id: 'usr_xxxxxxxxxxxxxxxx' },
    entity: { type: entityKey, id: 'xxxxxxxxxxxxxxxx' },
    data: { id: 'xxxxxxxxxxxxxxxx', status: '...', ...(events?.exclude ? {} : {}) },
    previous: {},
    metadata: { correlationId: 'cor_xxxxxxxxxxxxxxxx', source: 'cell-engine' },
  };

  return (
    <div className="p-4 space-y-5">
      {/* Section 1 — Event Configuration */}
      {events && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Event Configuration</p>
          <div className="rounded-lg border border-blue-100 dark:border-blue-800/40 bg-blue-50/20 dark:bg-blue-900/10 px-3 py-3 space-y-2.5">
            {events.exclude !== undefined && (
              <div className="flex items-start gap-2">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 w-14 shrink-0 pt-0.5">
                  Exclude
                </span>
                {events.exclude.length === 0 ? (
                  <span className="text-[10px] text-gray-400 italic">none (all fields included)</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {events.exclude.map((k) => (
                      <Badge
                        key={k}
                        variant="outline"
                        className="text-[9px] font-mono px-1.5 py-0.5 leading-none text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-700"
                      >
                        {k}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            {events.names && (
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1.5">Name Overrides</span>
                <div className="space-y-1">
                  {(['created', 'updated', 'deleted'] as const).map((action) =>
                    events.names?.[action] ? (
                      <div key={action} className="flex items-center gap-2 text-[10px]">
                        <span className="text-gray-400 w-12 shrink-0">{action}</span>
                        <span className="text-gray-400 shrink-0">→</span>
                        <code className="font-mono text-blue-600 dark:text-blue-400">{events.names[action]}</code>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 2 — Emitted Events */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          Emitted Events ({3 + transitions.length + relations.length})
        </p>

        {/* Entity Events */}
        <div className="mb-3">
          <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1.5">Entity</p>
          <div className="space-y-1.5">
            {[
              { name: createdName, desc: 'Entity created' },
              { name: updatedName, desc: 'Entity updated' },
              { name: deletedName, desc: 'Entity soft-deleted' },
            ].map(({ name, desc }) => (
              <div key={name} className="flex items-center gap-2">
                <code className="text-[10px] font-mono font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded truncate flex-1">
                  {name}
                </code>
                <span className="text-[9px] text-gray-400 shrink-0">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lifecycle Transition Events */}
        {transitions.length > 0 && (
          <div className="mb-3">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1.5">Lifecycle Transitions</p>
            <div className="space-y-1.5">
              {transitions.map((t) => {
                const name = t.event ?? `entity.${entityKey}.transition.${t.key}`;
                return (
                  <div key={t.key} className="flex items-center gap-2">
                    <code className="text-[10px] font-mono font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded truncate flex-1">
                      {name}
                    </code>
                    <span className="text-[9px] text-gray-400 shrink-0">
                      {t.from} → {t.to}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Relation Events */}
        {relations.length > 0 && (
          <div className="mb-3">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1.5">Relations</p>
            <div className="space-y-1.5">
              {relations.map((rel) => {
                const name = `entity.${entityKey}.relation.${rel.key}.changed`;
                return (
                  <div key={rel.key} className="flex items-center gap-2">
                    <code className="text-[10px] font-mono font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded truncate flex-1">
                      {name}
                    </code>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 leading-none shrink-0">
                      {rel.relation.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Section 3 — Envelope Preview (collapsed by default) */}
      <div>
        <button
          type="button"
          onClick={() => setEnvelopeExpanded((v) => !v)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-2"
        >
          <span>{envelopeExpanded ? '▾' : '▸'}</span>
          Envelope Preview
        </button>
        {envelopeExpanded && (
          <pre className="text-[10px] font-mono bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded p-3 overflow-x-auto text-gray-600 dark:text-gray-400 leading-relaxed">
            {JSON.stringify(sampleEnvelope, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ── Entity viewer ─────────────────────────────────────────────────────────────

function FieldCard({
  field,
  cf,
  inList,
  translations,
  depth,
}: {
  field: FieldDefinition;
  cf: ResolvedCreateField | undefined;
  inList: boolean;
  translations: Record<string, string>;
  depth: number;
}) {
  const inCreate = !!cf;
  const rules = cf?.effectiveFieldRules ?? [];

  const [expanded, setExpanded] = useState(true);

  if (field.type === 'object') {
    const childFields = field.fields ?? [];
    const childMap = new Map(cf?.children?.map((c) => [c.key, c]) ?? []);
    return (
      <div
        key={field.key}
        className="rounded-lg border border-blue-100 dark:border-blue-800/40 bg-blue-50/30 dark:bg-blue-900/10 overflow-hidden"
      >
        {/* Object section header — clickable to expand/collapse */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 border-b border-blue-100 dark:border-blue-800/40 bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-100/60 dark:hover:bg-blue-900/30 transition-colors text-left"
        >
          <span className="text-[9px] text-blue-400 dark:text-blue-500 shrink-0 w-3">{expanded ? '▾' : '▸'}</span>
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{field.name}</span>
          <code className="text-[10px] font-mono text-blue-400 dark:text-blue-500">{field.key}</code>
          {field.system && (
            <Badge
              variant="outline"
              className="text-[9px] text-gray-400 border-gray-200 dark:border-gray-600 px-1 py-0 leading-none"
            >
              system
            </Badge>
          )}
          <span className="ml-auto text-[9px] text-blue-400 dark:text-blue-500">
            {childFields.length} field{childFields.length !== 1 ? 's' : ''}
          </span>
          <Badge
            variant="outline"
            className="text-[9px] font-mono px-1.5 py-0 leading-none text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700"
          >
            object
          </Badge>
        </button>

        {/* Child fields — collapsed when not expanded */}
        {expanded && (
          <div
            className={`px-3 py-2 space-y-2 ${depth > 0 ? 'ml-4 border-l-2 border-gray-100 dark:border-gray-700 pl-3' : ''}`}
          >
            {childFields.map((child) => (
              <FieldCard
                key={child.key}
                field={child}
                cf={childMap.get(child.key)}
                inList={false}
                translations={translations}
                depth={depth + 1}
              />
            ))}
            {childFields.length === 0 && <p className="text-[10px] text-gray-400 italic">No child fields defined.</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      key={field.key}
      className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden"
    >
      {/* Field header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/60">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{field.name}</span>
        <code className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{field.key}</code>
        {field.system && (
          <Badge
            variant="outline"
            className="text-[9px] text-gray-400 border-gray-200 dark:border-gray-600 px-1 py-0 leading-none"
          >
            system
          </Badge>
        )}
        <Badge variant="outline" className="ml-auto text-[9px] font-mono px-1.5 py-0 leading-none">
          {field.type}
        </Badge>
      </div>

      {/* Field body */}
      <div className="px-3 py-2 space-y-1.5">
        {/* List + Create visibility */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 w-8 shrink-0">List</span>
            {inList ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold">✓</span>
                {field.list?.sortable && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 text-gray-500 dark:text-gray-400 leading-none"
                  >
                    sort
                  </Badge>
                )}
                {field.list?.searchable && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 text-gray-500 dark:text-gray-400 leading-none"
                  >
                    search
                  </Badge>
                )}
                {field.list?.filterable && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 text-gray-500 dark:text-gray-400 leading-none"
                  >
                    filter
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-gray-300 dark:text-gray-600">—</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 w-12 shrink-0">Create</span>
            {inCreate ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold">✓</span>
                <span className="text-[10px] text-gray-400">#{cf!.effectiveOrder}</span>
                {cf?.effectivePlaceholder && (
                  <span
                    className="text-[10px] text-gray-400 italic truncate max-w-[120px]"
                    title={cf.effectivePlaceholder}
                  >
                    "{cf.effectivePlaceholder}"
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-gray-300 dark:text-gray-600">—</span>
            )}
          </div>
        </div>

        {/* Enum values */}
        {field.type === 'enum' && field.enumValues && field.enumValues.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 w-8 shrink-0">Values</span>
            <div className="flex gap-1 flex-wrap">
              {field.enumValues.map((v) => (
                <Badge key={v} variant="outline" className="text-[9px] font-mono px-1 py-0 leading-none">
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Help text */}
        {field.helpText && (
          <div className="flex items-start gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 w-8 shrink-0 pt-0.5">Help</span>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">{field.helpText}</p>
          </div>
        )}

        {/* Validation rules */}
        <FieldRuleList rules={rules} translations={translations} />
      </div>
    </div>
  );
}

function EntityViewer({
  entity,
  compiledApp,
  translations,
}: {
  entity: ManifestPreviewEntity;
  compiledApp: ManifestPreviewData;
  translations: Record<string, string>;
}) {
  const listFieldKeys = new Set(entity.listFields.map((f) => f.key));
  const createFieldMap = new Map(entity.createFields.map((f) => [f.key, f]));
  const totalRules = entity.createFields.reduce((sum, f) => sum + f.effectiveFieldRules.length, 0);
  const hasRelations = entity.relations.length > 0;
  const hasComputed = entity.computed.length > 0;
  const hasLifecycle = entity.lifecycle !== undefined;
  const hasEvents = entity.events !== undefined;
  const hasCapabilities = (entity.capabilities ?? []).length > 0;
  const hasPolicies = !!(entity.policies || (entity.fieldPolicies && Object.keys(entity.fieldPolicies).length > 0));
  const showTabs = hasRelations || hasComputed || hasLifecycle || hasEvents || hasCapabilities || hasPolicies;
  const [tab, setTab] = useState<
    'fields' | 'relations' | 'computed' | 'lifecycle' | 'events' | 'capabilities' | 'policies'
  >('fields');

  return (
    <div className="flex flex-col h-full">
      {/* Entity header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{entity.name}</p>
          <p className="text-xs text-gray-400">
            {entity.pluralName} · {entity.fields.length} field{entity.fields.length !== 1 ? 's' : ''}
            {totalRules > 0 && ` · ${totalRules} validation rule${totalRules !== 1 ? 's' : ''}`}
            {hasRelations && ` · ${entity.relations.length} relation${entity.relations.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <code className="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
          {entity.key}
        </code>
      </div>

      {/* Tabs — when relations or computed fields are present */}
      {showTabs && (
        <div className="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
          {(
            [
              { key: 'fields', label: 'Fields' },
              ...(hasRelations ? [{ key: 'relations', label: 'Relations' }] : []),
              ...(hasComputed ? [{ key: 'computed', label: 'Computed' }] : []),
              ...(hasLifecycle ? [{ key: 'lifecycle', label: 'Lifecycle' }] : []),
              ...(hasEvents ? [{ key: 'events', label: 'Events' }] : []),
              ...(hasCapabilities
                ? [{ key: 'capabilities', label: `Capabilities (${(entity.capabilities ?? []).length})` }]
                : []),
              ...(hasPolicies ? [{ key: 'policies', label: 'Policies' }] : []),
            ] as {
              key: 'fields' | 'relations' | 'computed' | 'lifecycle' | 'events' | 'capabilities' | 'policies';
              label: string;
            }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 text-[11px] whitespace-nowrap ${
                tab === t.key
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium dark:border-blue-400 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {(!showTabs || tab === 'fields') && (
          <div className="p-4 space-y-3">
            {entity.fields.map((field) => (
              <FieldCard
                key={field.key}
                field={field}
                cf={createFieldMap.get(field.key)}
                inList={listFieldKeys.has(field.key)}
                translations={translations}
                depth={0}
              />
            ))}
          </div>
        )}
        {hasRelations && tab === 'relations' && <RelationDiagram entity={entity} />}
        {hasComputed && tab === 'computed' && <ComputedFieldViewer computed={entity.computed} />}
        {hasLifecycle && tab === 'lifecycle' && entity.lifecycle && <LifecycleViewer lifecycle={entity.lifecycle} />}
        {hasEvents && tab === 'events' && <EventsViewer entity={entity} />}
        {hasCapabilities && tab === 'capabilities' && <CapabilitiesViewer entity={entity} />}
        {hasPolicies && tab === 'policies' && <PoliciesViewer entity={entity} compiledApp={compiledApp} />}
      </div>
    </div>
  );
}

// ── Capabilities viewer ────────────────────────────────────────────────────────

const CAPABILITY_TYPE_COLORS: Record<string, string> = {
  transition: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  mutation:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700',
  workflow:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700',
  export: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
  integration: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700',
};

function CapabilitiesViewer({ entity }: { entity: ManifestPreviewEntity }) {
  const caps: CapabilityDefinition[] = entity.capabilities ?? [];

  if (caps.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-400">No capabilities defined.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-gray-400 mb-2">
        {caps.length} capability{caps.length !== 1 ? 'ies' : ''}
      </p>
      {caps.map((cap) => {
        const inputs = cap.inputs ?? [];
        return (
          <div
            key={cap.key}
            className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/60 flex-wrap">
              <code className="text-[10px] font-mono font-semibold text-gray-700 dark:text-gray-300">{cap.key}</code>
              <Badge
                variant="outline"
                className={`text-[9px] font-medium px-1.5 py-0.5 leading-none ${CAPABILITY_TYPE_COLORS[cap.type] ?? ''}`}
              >
                {cap.type}
              </Badge>
              {cap.confirm && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 leading-none text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-700"
                >
                  confirm
                </Badge>
              )}
              {cap.description && <span className="text-[10px] text-gray-400 italic ml-1">{cap.description}</span>}
            </div>
            {/* Body */}
            <div className="px-3 py-2 space-y-2">
              {/* Generated endpoint */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest text-gray-400 shrink-0">endpoint</span>
                <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400">
                  POST /entities/{entity.key}/[id]/{cap.key}
                </code>
              </div>
              {/* Inputs */}
              {inputs.length > 0 && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1.5">
                    {inputs.length} input{inputs.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-1">
                    {inputs.map((input) => (
                      <div key={input.key} className="flex items-center gap-2 text-[10px]">
                        <code className="font-mono text-gray-600 dark:text-gray-400 w-24 shrink-0 truncate">
                          {input.key}
                        </code>
                        <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 leading-none">
                          {input.type}
                        </Badge>
                        {input.required && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 leading-none text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-700"
                          >
                            required
                          </Badge>
                        )}
                        {input.type === 'select' && input.options && input.options.length > 0 && (
                          <span className="text-gray-400 truncate">[{input.options.join(', ')}]</span>
                        )}
                        {input.type === 'entity' && input.entity && (
                          <span className="text-gray-400">→ {input.entity}</span>
                        )}
                        {input.label && <span className="text-gray-400 italic truncate">{input.label}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Policies viewer ────────────────────────────────────────────────────────────

const SCOPE_SOURCE_COLORS: Record<string, string> = {
  'built-in': 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
  transition: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  capability:
    'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
  custom:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700',
};

function PoliciesViewer({ entity, compiledApp }: { entity: ManifestPreviewEntity; compiledApp: ManifestPreviewData }) {
  const policies = entity.policies as EntityPoliciesDefinition | undefined;
  const fieldPolicies = entity.fieldPolicies as FieldPoliciesDefinition | undefined;
  const scopeRegistry = entity.scopeRegistry ?? [];
  const roles = compiledApp.roles ?? [];
  const actions = ['view', 'create', 'update', 'delete'] as const;

  const entityKey = entity.key;
  const transitionKeys = new Set((entity.lifecycle?.transitions ?? []).map((t) => t.key));
  const capabilityScopes = new Map((entity.capabilities ?? []).map((c) => [c.scope ?? `${entityKey}.${c.key}`, c.key]));

  function scopeSource(scope: string): string {
    const suffix = scope.startsWith(`${entityKey}.`) ? scope.slice(entityKey.length + 1) : null;
    if (suffix === 'view' || suffix === 'create' || suffix === 'update' || suffix === 'delete') return 'built-in';
    if (suffix && transitionKeys.has(suffix)) return 'transition';
    if (capabilityScopes.has(scope)) return 'capability';
    return 'custom';
  }

  return (
    <div className="p-4 space-y-5">
      {/* Action Policies */}
      {policies && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Action Policies</p>
          <div className="space-y-2">
            {actions.map((action) => {
              const policy = policies[action];
              if (!policy) return null;
              return (
                <div
                  key={action}
                  className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 leading-none text-gray-500 shrink-0 w-12 justify-center"
                    >
                      {action}
                    </Badge>
                    <code className="text-[10px] font-mono font-medium text-blue-600 dark:text-blue-400 flex-1">
                      {policy.scope}
                    </code>
                  </div>
                  {policy.condition && (
                    <p className="text-[10px] font-mono text-amber-700 dark:text-amber-400 mt-1.5 bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 rounded break-all">
                      if: {policy.condition}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Field Policies */}
      {fieldPolicies && Object.keys(fieldPolicies).length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
            Field Policies ({Object.keys(fieldPolicies).length} field
            {Object.keys(fieldPolicies).length !== 1 ? 's' : ''})
          </p>
          <div className="space-y-2">
            {Object.entries(fieldPolicies).map(([fieldKey, fp]) => (
              <div
                key={fieldKey}
                className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-2"
              >
                <code className="text-[10px] font-mono font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  {fieldKey}
                </code>
                <div className="space-y-1">
                  {fp.view && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 leading-none text-gray-400 w-10 justify-center"
                      >
                        view
                      </Badge>
                      <code className="font-mono text-blue-600 dark:text-blue-400">{fp.view.scope}</code>
                    </div>
                  )}
                  {fp.update && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 leading-none text-gray-400 w-10 justify-center"
                      >
                        update
                      </Badge>
                      <code className="font-mono text-blue-600 dark:text-blue-400">{fp.update.scope}</code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scope Registry */}
      {scopeRegistry.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
            Scope Registry ({scopeRegistry.length})
          </p>
          <div className="space-y-1.5">
            {scopeRegistry.map((scope) => {
              const source = scopeSource(scope);
              return (
                <div key={scope} className="flex items-center gap-2">
                  <code className="text-[10px] font-mono text-gray-700 dark:text-gray-300 flex-1 truncate bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    {scope}
                  </code>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 leading-none shrink-0 ${SCOPE_SOURCE_COLORS[source] ?? ''}`}
                  >
                    {source}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Roles */}
      {roles.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Roles ({roles.length})</p>
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.key}
                className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-2 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <code className="text-[10px] font-mono font-semibold text-gray-700 dark:text-gray-300">
                    {role.key}
                  </code>
                  {role.name && <span className="text-[10px] text-gray-500 italic">{role.name}</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.scopes.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="text-[9px] font-mono px-1.5 py-0 leading-none text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-700"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
                {role.identityMappings && role.identityMappings.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400">mappings</span>
                    {role.identityMappings.map((m) => (
                      <Badge
                        key={m}
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 leading-none text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-700"
                      >
                        {m}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Validation rules viewer ────────────────────────────────────────────────────

function ValidationRulesViewer({
  entity,
  translations,
}: {
  entity: ManifestPreviewEntity;
  translations: Record<string, string>;
}) {
  const fieldsWithRules = entity.createFields.filter((f) => f.effectiveFieldRules.length > 0);
  const totalRules = fieldsWithRules.reduce((sum, f) => sum + f.effectiveFieldRules.length, 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{entity.name}</p>
          <p className="text-xs text-gray-400">
            {fieldsWithRules.length} field{fieldsWithRules.length !== 1 ? 's' : ''} · {totalRules} rule
            {totalRules !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {fieldsWithRules.length === 0 && (
        <p className="text-sm text-gray-400">
          No validation rules defined. Add a{' '}
          <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">validation.fieldRules</code>{' '}
          block to any field.
        </p>
      )}

      {fieldsWithRules.map((field) => (
        <div
          key={field.key}
          className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/60">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{field.name}</span>
            <code className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{field.key}</code>
            <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 leading-none ml-auto">
              {field.type}
            </Badge>
          </div>
          <div className="px-3 py-2">
            <FieldRuleList rules={field.effectiveFieldRules} translations={translations} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const HEADER_LABELS: Record<BuilderMode, string> = {
  app: 'Preview',
  dashboard: 'Preview',
  list: 'Preview',
  detail: 'Preview',
  form: 'Preview',
  'simple-entity': 'Entity',
  'nested-entity': 'Entity',
  'entity-belongs-to': 'Entity',
  'entity-has-many': 'Entity',
  'entity-many-to-many': 'Entity',
  'entity-polymorphic': 'Entity',
  'entity-all-relations': 'Entity',
  'computed-expression': 'Entity',
  'computed-aggregation': 'Entity',
  'computed-conditional': 'Entity',
  'computed-all': 'Entity',
  'lifecycle-simple': 'Entity',
  'lifecycle-guards': 'Entity',
  'lifecycle-hooks': 'Entity',
  'lifecycle-full': 'Entity',
  'events-entity': 'Entity',
  'events-lifecycle': 'Entity',
  'events-full': 'Entity',
  'capabilities-simple': 'Entity',
  'capabilities-inputs': 'Entity',
  'capabilities-full': 'Entity',
  'policies-basic': 'Entity',
  'policies-conditional': 'Entity',
  'policies-field': 'Entity',
  'policies-roles': 'Entity',
  validation: 'Field Validations',
};

interface PreviewPanelProps {
  mode: BuilderMode;
  manifest: CellManifestV1 | null;
  parseError: string | null;
  validationErrors: ValidationError[];
  translations: Record<string, string>;
}

export function PreviewPanel({ mode, manifest, parseError, validationErrors, translations }: PreviewPanelProps) {
  const compiledApp = useMemo(() => (manifest ? deriveManifestPreviewData(manifest) : null), [manifest]);
  const hasErrors = parseError || validationErrors.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 dark:bg-gray-800 shrink-0">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          {HEADER_LABELS[mode]}
        </span>
        {compiledApp && <span className="text-xs text-gray-500 dark:text-gray-400">{compiledApp.metadata.name}</span>}
      </div>

      <div className="flex-1 overflow-auto">
        {hasErrors && !compiledApp && (
          <div className="p-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-xs text-red-700 dark:text-red-300">
              {parseError ?? `${validationErrors.length} validation error(s) — fix them to see the preview.`}
            </div>
          </div>
        )}

        {!compiledApp && !hasErrors && (
          <div className="p-4 text-xs text-gray-400">Paste JSON and click Load Sample to start.</div>
        )}

        {compiledApp &&
          (mode === 'simple-entity' ||
            mode === 'nested-entity' ||
            mode === 'entity-belongs-to' ||
            mode === 'entity-has-many' ||
            mode === 'entity-many-to-many' ||
            mode === 'entity-polymorphic' ||
            mode === 'entity-all-relations' ||
            mode === 'computed-expression' ||
            mode === 'computed-aggregation' ||
            mode === 'computed-conditional' ||
            mode === 'computed-all' ||
            mode === 'lifecycle-simple' ||
            mode === 'lifecycle-guards' ||
            mode === 'lifecycle-hooks' ||
            mode === 'lifecycle-full' ||
            mode === 'events-entity' ||
            mode === 'events-lifecycle' ||
            mode === 'events-full' ||
            mode === 'capabilities-simple' ||
            mode === 'capabilities-inputs' ||
            mode === 'capabilities-full' ||
            mode === 'policies-basic' ||
            mode === 'policies-conditional' ||
            mode === 'policies-field' ||
            mode === 'policies-roles') &&
          compiledApp.entities[0] && (
            <EntityViewer entity={compiledApp.entities[0]} compiledApp={compiledApp} translations={translations} />
          )}

        {compiledApp && mode === 'validation' && compiledApp.entities[0] && (
          <ValidationRulesViewer entity={compiledApp.entities[0]} translations={translations} />
        )}

        {compiledApp &&
          mode !== 'simple-entity' &&
          mode !== 'nested-entity' &&
          mode !== 'entity-belongs-to' &&
          mode !== 'entity-has-many' &&
          mode !== 'entity-many-to-many' &&
          mode !== 'entity-polymorphic' &&
          mode !== 'entity-all-relations' &&
          mode !== 'validation' &&
          mode !== 'computed-expression' &&
          mode !== 'computed-aggregation' &&
          mode !== 'computed-conditional' &&
          mode !== 'computed-all' &&
          mode !== 'lifecycle-simple' &&
          mode !== 'lifecycle-guards' &&
          mode !== 'lifecycle-hooks' &&
          mode !== 'lifecycle-full' &&
          mode !== 'events-entity' &&
          mode !== 'events-lifecycle' &&
          mode !== 'events-full' &&
          mode !== 'capabilities-simple' &&
          mode !== 'capabilities-inputs' &&
          mode !== 'capabilities-full' &&
          mode !== 'policies-basic' &&
          mode !== 'policies-conditional' &&
          mode !== 'policies-field' &&
          mode !== 'policies-roles' &&
          manifest && (
            <div className="h-full">
              <CellAppRenderer key={manifest.metadata.key} manifest={manifest} />
            </div>
          )}
      </div>
    </div>
  );
}
