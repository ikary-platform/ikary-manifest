import { useMemo } from 'react';
import type { UIPrimitiveDefinition } from '@ikary/primitives';
import type { PrimitiveCatalogEntry } from '../../shared/catalog';

export function usePrimitiveCatalog(
  primitives: UIPrimitiveDefinition[],
  categoryHints?: Record<string, PrimitiveCatalogEntry['category']>,
): PrimitiveCatalogEntry[] {
  return useMemo(
    () =>
      primitives.map((def) => ({
        key: def.name,
        label: toLabel(def.name),
        category: categoryHints?.[def.name] ?? 'custom',
        version: def.version,
        source: def.source ?? 'core',
        isController: def.isController,
      })),
    [primitives, categoryHints],
  );
}

function toLabel(key: string): string {
  return key
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
