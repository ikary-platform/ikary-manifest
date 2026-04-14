import type { EntityDefinition } from '@ikary/cell-contract';
import type { DiagramEntityDef, ConnectorDef } from './relationDiagramModel';
import { RELATION_COLORS, buildDiagramData } from './relationDiagramModel';
import { useDiagramLayout } from './useDiagramLayout';
import { EntityCard } from './EntityCard';
import { RelationLegend } from './RelationLegend';

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
  const { containerRef, fieldRefs, connectorLines } = useDiagramLayout(entities, connectors);

  const byCol = new Map<number, DiagramEntityDef[]>();
  for (const e of entities) {
    const arr = byCol.get(e.col) ?? [];
    arr.push(e);
    byCol.set(e.col, arr);
  }

  const cols = Array.from(byCol.keys()).sort();

  // Collect only relation types actually present
  const presentTypes = Array.from(new Set(relations.map((r) => r.relation)));

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Legend — only show types that appear */}
      <RelationLegend presentTypes={presentTypes} />

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
          {connectorLines.map((line, i) => (
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
