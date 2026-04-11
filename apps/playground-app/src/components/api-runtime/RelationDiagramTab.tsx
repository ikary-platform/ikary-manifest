import { useRef, useState, useLayoutEffect } from 'react';
import type { EntityDefinition, RelationDefinition } from '@ikary/contract';

// ── Internal types ──────────────────────────────────────────────────────────

interface DiagramField {
  key: string;
  isFK: boolean;
  isPK: boolean;
  label: string;
}

interface DiagramEntityDef {
  key: string;
  name: string;
  isStub: boolean;
  col: number;
  row: number;
  fields: DiagramField[];
}

interface ConnectorDef {
  sourceEntityKey: string;
  sourceFieldKey: string;
  targetEntityKey: string;
  targetFieldKey: string;
  relationType: RelationDefinition['relation'];
}

interface FieldRowRef {
  entityKey: string;
  fieldKey: string;
  el: HTMLDivElement | null;
}

interface SvgConnector {
  d: string;
  color: string;
  dashed: boolean;
  relationType: RelationDefinition['relation'];
}

// ── Constants ───────────────────────────────────────────────────────────────

const RELATION_COLORS: Record<RelationDefinition['relation'], string> = {
  belongs_to: '#3b82f6',
  has_many: '#8b5cf6',
  many_to_many: '#10b981',
  self: '#f59e0b',
  polymorphic: '#6b7280',
};

// ── Data builder ────────────────────────────────────────────────────────────

function buildDiagramData(
  entity: EntityDefinition,
): { entities: DiagramEntityDef[]; connectors: ConnectorDef[] } {
  const relations = entity.relations ?? [];
  const entityMap = new Map<string, DiagramEntityDef>();
  const connectors: ConnectorDef[] = [];

  // Build virtual FK fields for belongs_to / self — rel.key acts as the DOM
  // anchor so the SVG path has something to attach to.
  const fkFields: DiagramField[] = [];
  for (const rel of relations) {
    if (rel.relation === 'belongs_to') {
      fkFields.push({
        key: rel.key,
        isFK: true,
        isPK: false,
        label: rel.foreignKey ?? `${rel.key}_id`,
      });
    } else if (rel.relation === 'self') {
      fkFields.push({ key: rel.key, isFK: true, isPK: false, label: rel.key });
    }
  }

  const hasPolymorphic = relations.some((r) => r.relation === 'polymorphic');

  const visibleFields = (entity.fields ?? [])
    .filter((f) => f.list?.visible)
    .slice(0, 4)
    .map((f) => ({ key: f.key, isFK: false, isPK: false, label: f.key }));

  const primaryFields: DiagramField[] = [
    { key: 'id', isFK: false, isPK: true, label: 'id' },
    ...fkFields,
    ...visibleFields.filter((f) => !fkFields.some((fk) => fk.key === f.key)),
  ];

  if (hasPolymorphic) {
    primaryFields.push({ key: 'target_id', isFK: true, isPK: false, label: 'target_id' });
    primaryFields.push({ key: 'target_type', isFK: false, isPK: false, label: 'target_type' });
  }

  entityMap.set(entity.key, {
    key: entity.key,
    name: entity.name,
    isStub: false,
    col: 0,
    row: 0,
    fields: primaryFields,
  });

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

// ── EntityCard ───────────────────────────────────────────────────────────────

function EntityCard({
  def,
  fieldRefs,
}: {
  def: DiagramEntityDef;
  fieldRefs: React.MutableRefObject<FieldRowRef[]>;
}) {
  return (
    <div
      style={{
        minWidth: 140,
        borderRadius: 8,
        border: def.isStub ? '1.5px dashed #cbd5e1' : '1px solid #e2e8f0',
        background: def.isStub ? '#f8fafc' : '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        fontSize: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderBottom: def.isStub ? '1px dashed #e2e8f0' : '1px solid #f1f5f9',
          background: def.isStub ? '#f1f5f9' : '#f8fafc',
        }}
      >
        <span style={{ fontSize: 9, color: '#94a3b8' }}>▦</span>
        <span
          style={{
            fontWeight: 600,
            color: def.isStub ? '#94a3b8' : '#374151',
            fontStyle: def.isStub ? 'italic' : 'normal',
            fontSize: 11,
          }}
        >
          {def.name}
        </span>
        {def.isStub && (
          <span style={{ marginLeft: 'auto', fontSize: 8, color: '#94a3b8' }}>stub</span>
        )}
      </div>
      {/* Fields */}
      {def.fields.map((f) => (
        <div
          key={f.key}
          ref={(el) => {
            const existing = fieldRefs.current.find(
              (r) => r.entityKey === def.key && r.fieldKey === f.key,
            );
            if (existing) {
              existing.el = el;
            } else {
              fieldRefs.current.push({ entityKey: def.key, fieldKey: f.key, el });
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderBottom: '1px solid #f8fafc',
            background: f.isFK ? 'rgba(59,130,246,0.04)' : 'transparent',
          }}
        >
          {f.isPK && (
            <span style={{ fontSize: 9 }} title="primary key">
              🔑
            </span>
          )}
          {f.isFK && !f.isPK && (
            <span style={{ fontSize: 9 }} title="foreign key">
              🔗
            </span>
          )}
          {!f.isPK && !f.isFK && <span style={{ width: 13 }} />}
          <code
            style={{
              fontSize: 10,
              fontFamily: 'monospace',
              lineHeight: 1.3,
              color: f.isPK ? '#94a3b8' : f.isFK ? '#2563eb' : '#64748b',
            }}
          >
            {f.label}
          </code>
        </div>
      ))}
    </div>
  );
}

// ── RelationDiagramTab ───────────────────────────────────────────────────────

export function RelationDiagramTab({ entity }: { entity: EntityDefinition }) {
  const relations = entity.relations ?? [];

  if (relations.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
          color: '#94a3b8',
          fontSize: 13,
        }}
      >
        No relations defined on this entity.
      </div>
    );
  }

  const { entities, connectors } = buildDiagramData(entity);

  return <DiagramInner entities={entities} connectors={connectors} relations={relations} />;
}

// Split into child so hooks aren't called conditionally above
function DiagramInner({
  entities,
  connectors,
  relations,
}: {
  entities: DiagramEntityDef[];
  connectors: ConnectorDef[];
  relations: NonNullable<EntityDefinition['relations']>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<FieldRowRef[]>([]);
  const [svgLines, setSvgLines] = useState<SvgConnector[]>([]);

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

  // Collect only relation types actually present
  const presentTypes = Array.from(new Set(relations.map((r) => r.relation)));

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Legend — only show types that appear */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {(Object.entries(RELATION_COLORS) as [RelationDefinition['relation'], string][])
          .filter(([type]) => presentTypes.includes(type))
          .map(([type, color]) => {
            const dashed = type === 'has_many' || type === 'polymorphic';
            return (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                <span style={{ fontSize: 10, color: '#64748b' }}>{type.replace(/_/g, ' ')}</span>
              </div>
            );
          })}
      </div>

      {/* Diagram */}
      <div ref={containerRef} style={{ position: 'relative', display: 'flex', gap: 48, alignItems: 'flex-start' }}>
        {/* SVG overlay */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
            zIndex: 10,
          }}
        >
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
              <circle r={3} fill={line.color} opacity={0.8}>
                <animateMotion
                  dur="0s"
                  fill="freeze"
                  path={line.d}
                  keyPoints="1"
                  keyTimes="1"
                  calcMode="linear"
                />
              </circle>
            </g>
          ))}
        </svg>

        {cols.map((col) => (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1 }}>
            {(byCol.get(col) ?? []).map((def) => (
              <EntityCard key={def.key} def={def} fieldRefs={fieldRefs} />
            ))}
          </div>
        ))}
      </div>

      {/* Relation summary */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 4 }}>
          {relations.length} relation{relations.length !== 1 ? 's' : ''}
        </p>
        {relations.map((rel) => (
          <div key={rel.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                backgroundColor: RELATION_COLORS[rel.relation],
              }}
            />
            <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#374151' }}>{rel.key}</code>
            <span
              style={{
                fontSize: 9,
                padding: '1px 5px',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                color: '#64748b',
                lineHeight: 1.4,
              }}
            >
              {rel.relation.replace(/_/g, ' ')}
            </span>
            {'entity' in rel && (
              <span style={{ fontSize: 10, color: '#94a3b8' }}>→ {rel.entity}</span>
            )}
            {'through' in rel && (
              <span style={{ fontSize: 10, color: '#94a3b8' }}>through {rel.through}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
