import { useRef, useState, useLayoutEffect } from 'react';
import type { ConnectorDef, DiagramEntityDef, FieldRowRef, SvgConnector } from './relationDiagramModel';
import { RELATION_COLORS } from './relationDiagramModel';

export function useDiagramLayout(
  entities: DiagramEntityDef[],
  connectors: ConnectorDef[],
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<FieldRowRef[]>([]);
  const [connectorLines, setConnectorLines] = useState<SvgConnector[]>([]);

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

    setConnectorLines((prev) => {
      const prevStr = JSON.stringify(prev);
      const nextStr = JSON.stringify(lines);
      return prevStr === nextStr ? prev : lines;
    });
  });

  return { containerRef, fieldRefs, connectorLines };
}
