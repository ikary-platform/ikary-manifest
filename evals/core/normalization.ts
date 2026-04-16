import { compileCellApp, isValidationResult } from '@ikary/cell-engine';

export function normalizeManifestForComparison(manifest: unknown): unknown {
  if (!manifest || typeof manifest !== 'object') return manifest;

  try {
    const compiled = compileCellApp(manifest as never);
    if (!isValidationResult(compiled)) {
      return sortValue(compiled);
    }
  } catch {
    // Ignore compile failures and fall back to generic sorting.
  }

  return sortValue(manifest);
}

export function extractEntityKeys(manifest: unknown): string[] {
  return extractByPath(manifest, ['spec', 'entities'], 'key');
}

export function extractPageKeys(manifest: unknown): string[] {
  return extractByPath(manifest, ['spec', 'pages'], 'key');
}

export function extractRelationKeys(manifest: unknown): string[] {
  const entities = extractPath(manifest, ['spec', 'entities']);
  if (!Array.isArray(entities)) return [];
  return entities.flatMap((entity) => {
    const relations = typeof entity === 'object' && entity !== null
      ? (entity as { relations?: unknown[] }).relations
      : undefined;
    if (!Array.isArray(relations)) return [];
    return relations
      .map((relation) => (typeof relation === 'object' && relation !== null ? (relation as { key?: string }).key : undefined))
      .filter((value): value is string => Boolean(value));
  });
}

export function extractPrimitiveKeys(manifest: unknown): string[] {
  const pages = extractPath(manifest, ['spec', 'pages']);
  if (!Array.isArray(pages)) return [];
  return pages.flatMap((page) => {
    if (typeof page !== 'object' || page === null) return [];
    const bindings = (page as { slotBindings?: unknown[] }).slotBindings;
    if (!Array.isArray(bindings)) return [];
    return bindings
      .map((binding) => (typeof binding === 'object' && binding !== null ? (binding as { primitive?: string }).primitive : undefined))
      .filter((value): value is string => Boolean(value));
  });
}

export function hasFieldPath(manifest: unknown, fieldPath: string): boolean {
  return extractPath(manifest, fieldPath.split('.')) !== undefined;
}

export function containsIdentifier(manifest: unknown, identifier: string): boolean {
  return JSON.stringify(normalizeManifestForComparison(manifest)).toLowerCase().includes(identifier.toLowerCase());
}

function extractByPath(manifest: unknown, path: string[], key: string): string[] {
  const collection = extractPath(manifest, path);
  if (!Array.isArray(collection)) return [];
  return collection
    .map((item) => (typeof item === 'object' && item !== null ? (item as Record<string, unknown>)[key] : undefined))
    .filter((value): value is string => typeof value === 'string');
}

function extractPath(manifest: unknown, path: string[]): unknown {
  let current: unknown = manifest;
  for (const segment of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    const sorted = value.map((entry) => sortValue(entry));
    if (sorted.every((entry) => typeof entry !== 'object' || entry === null)) {
      return [...sorted].sort(comparePrimitiveValues);
    }
    if (sorted.every((entry) => typeof entry === 'object' && entry !== null && 'key' in (entry as Record<string, unknown>))) {
      return [...sorted].sort((left, right) => {
        const leftKey = String((left as Record<string, unknown>)['key']);
        const rightKey = String((right as Record<string, unknown>)['key']);
        return leftKey.localeCompare(rightKey);
      });
    }
    return sorted;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, sortValue(entry)]),
    );
  }
  return value;
}

function comparePrimitiveValues(left: unknown, right: unknown): number {
  return String(left).localeCompare(String(right));
}
