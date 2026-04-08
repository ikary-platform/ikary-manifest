import { describe, it, expect } from 'vitest';
import {
  buildEntityDetailPath,
  buildEntityCreatePath,
  buildEntityEditPath,
  buildEntityListPath,
} from './entity-path-helpers';
import type { CellManifestV1 } from '@ikary/contract';

function makeManifest(pages: Array<{ entity: string; type: string; path: string }>): CellManifestV1 {
  return {
    version: '1.0',
    cellKey: 'test',
    spec: {
      entities: [],
      pages: pages as never,
      navigation: { items: [] },
    },
  } as unknown as CellManifestV1;
}

describe('buildEntityDetailPath', () => {
  it('returns path with :id replaced by recordId', () => {
    const manifest = makeManifest([{ entity: 'customer', type: 'entity-detail', path: '/customers/:id' }]);
    expect(buildEntityDetailPath(manifest, 'customer', 'abc-123')).toBe('/customers/abc-123');
  });

  it('URL-encodes the recordId', () => {
    const manifest = makeManifest([{ entity: 'customer', type: 'entity-detail', path: '/customers/:id' }]);
    expect(buildEntityDetailPath(manifest, 'customer', 'a b')).toBe('/customers/a%20b');
  });

  it('returns null when no entity-detail page exists', () => {
    const manifest = makeManifest([{ entity: 'customer', type: 'entity-list', path: '/customers' }]);
    expect(buildEntityDetailPath(manifest, 'customer', '123')).toBeNull();
  });

  it('returns null when entityKey does not match', () => {
    const manifest = makeManifest([{ entity: 'order', type: 'entity-detail', path: '/orders/:id' }]);
    expect(buildEntityDetailPath(manifest, 'customer', '123')).toBeNull();
  });

  it('returns null when pages list is empty', () => {
    const manifest = makeManifest([]);
    expect(buildEntityDetailPath(manifest, 'customer', '123')).toBeNull();
  });
});

describe('buildEntityCreatePath', () => {
  it('returns the create page path', () => {
    const manifest = makeManifest([{ entity: 'customer', type: 'entity-create', path: '/customers/new' }]);
    expect(buildEntityCreatePath(manifest, 'customer')).toBe('/customers/new');
  });

  it('returns null when no entity-create page exists', () => {
    const manifest = makeManifest([{ entity: 'customer', type: 'entity-list', path: '/customers' }]);
    expect(buildEntityCreatePath(manifest, 'customer')).toBeNull();
  });
});

describe('buildEntityEditPath', () => {
  it('returns path with :id replaced', () => {
    const manifest = makeManifest([{ entity: 'customer', type: 'entity-edit', path: '/customers/:id/edit' }]);
    expect(buildEntityEditPath(manifest, 'customer', 'xyz')).toBe('/customers/xyz/edit');
  });

  it('returns null when no entity-edit page exists', () => {
    const manifest = makeManifest([]);
    expect(buildEntityEditPath(manifest, 'customer', 'xyz')).toBeNull();
  });
});

describe('buildEntityListPath', () => {
  it('returns the list page path', () => {
    const manifest = makeManifest([{ entity: 'customer', type: 'entity-list', path: '/customers' }]);
    expect(buildEntityListPath(manifest, 'customer')).toBe('/customers');
  });

  it('returns null when no entity-list page exists', () => {
    const manifest = makeManifest([]);
    expect(buildEntityListPath(manifest, 'customer')).toBeNull();
  });
});

describe('findEntityPage — spec.pages ?? [] branch', () => {
  it('handles manifest with undefined spec.pages', () => {
    const manifest = {
      version: '1.0',
      cellKey: 'test',
      spec: { entities: [], pages: undefined as never, navigation: { items: [] } },
    } as unknown as import('@ikary/contract').CellManifestV1;
    expect(buildEntityListPath(manifest, 'customer')).toBeNull();
  });
});
