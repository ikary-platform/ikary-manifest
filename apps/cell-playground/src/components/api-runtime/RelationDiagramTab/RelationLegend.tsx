import type { RelationDefinition } from '@ikary/cell-contract';
import { RELATION_COLORS } from './relationDiagramModel';

export function RelationLegend({
  presentTypes,
}: {
  presentTypes: RelationDefinition['relation'][];
}) {
  return (
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
  );
}
