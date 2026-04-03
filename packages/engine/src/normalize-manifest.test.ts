import { describe, it, expect } from 'vitest';
import { normalizeManifest } from './normalize-manifest';
import type { CellManifestV1 } from '@ikary-manifest/contract';

function baseManifest(spec: Partial<CellManifestV1['spec']> = {}): CellManifestV1 {
  return {
    version: '1.0',
    cellKey: 'test-cell',
    spec: {
      entities: undefined as never,
      pages: undefined as never,
      navigation: undefined as never,
      ...spec,
    },
  } as unknown as CellManifestV1;
}

describe('normalizeManifest', () => {
  it('preserves existing spec values unchanged', () => {
    const entity = { key: 'customer', label: 'Customer', fields: [], relations: [] };
    const manifest = baseManifest({ entities: [entity as never], pages: [], navigation: { items: [] } });
    const result = normalizeManifest(manifest);
    expect(result.spec.entities).toHaveLength(1);
    expect(result.spec.entities![0].key).toBe('customer');
  });

  it('defaults entities to [] when absent', () => {
    const manifest = baseManifest({});
    const result = normalizeManifest(manifest);
    expect(result.spec.entities).toEqual([]);
  });

  it('defaults pages to [] when absent', () => {
    const manifest = baseManifest({});
    const result = normalizeManifest(manifest);
    expect(result.spec.pages).toEqual([]);
  });

  it('defaults navigation to { items: [] } when absent', () => {
    const manifest = baseManifest({});
    const result = normalizeManifest(manifest);
    expect(result.spec.navigation).toEqual({ items: [] });
  });

  it('passes through top-level manifest fields (version, cellKey, etc.)', () => {
    const manifest: CellManifestV1 = {
      version: '1.0',
      cellKey: 'my-cell',
      spec: { entities: [], pages: [], navigation: { items: [] } },
    } as unknown as CellManifestV1;
    const result = normalizeManifest(manifest);
    expect((result as unknown as { version: string }).version).toBe('1.0');
    expect((result as unknown as { cellKey: string }).cellKey).toBe('my-cell');
  });

  it('does not mutate the original manifest', () => {
    const manifest = baseManifest({});
    normalizeManifest(manifest);
    // Original spec.entities should remain undefined
    expect((manifest.spec as unknown as { entities?: unknown }).entities).toBeUndefined();
  });
});
