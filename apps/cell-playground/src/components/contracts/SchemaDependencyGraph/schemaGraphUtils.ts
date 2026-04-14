import type { SchemaGraphNode } from '../schema-graph-model';

type NodeSortMode = 'degree' | 'name' | 'in_degree' | 'out_degree' | 'leaf_first' | 'hotspot_first';

export function sortNodes(nodes: readonly SchemaGraphNode[], sortMode: NodeSortMode): SchemaGraphNode[] {
  const items = [...nodes];

  items.sort((a, b) => {
    if (sortMode === 'name') {
      return a.label.localeCompare(b.label);
    }
    if (sortMode === 'in_degree') {
      return b.inDegree - a.inDegree || a.label.localeCompare(b.label);
    }
    if (sortMode === 'out_degree') {
      return b.outDegree - a.outDegree || a.label.localeCompare(b.label);
    }
    if (sortMode === 'leaf_first') {
      return Number(b.isLeaf) - Number(a.isLeaf) || a.label.localeCompare(b.label);
    }
    if (sortMode === 'hotspot_first') {
      return (
        Number(b.isHotspot) - Number(a.isHotspot) || b.totalDegree - a.totalDegree || a.label.localeCompare(b.label)
      );
    }
    return b.totalDegree - a.totalDegree || a.label.localeCompare(b.label);
  });

  return items;
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}

export function toCategoryLabel(category: string): string {
  if (category === 'all') {
    return 'All categories';
  }

  return category
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
