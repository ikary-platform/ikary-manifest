import { describe, it, expect } from 'vitest';
import {
  getManifestPages,
  findPageByKey,
  resolveLandingPath,
  getManifestRoutes,
  getManifestNavigation,
  findManifestEntity,
  resolveManifestEntityFromDefinition,
  resolveManifestEntity,
  resolveManifestEntities,
} from './selectors';
import type { CellManifestV1, EntityDefinition, PageDefinition } from '@ikary/contract';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePage(
  key: string,
  path: string,
  type: PageDefinition['type'] = 'entity-list',
  entity = 'customer',
): PageDefinition {
  return { key, path, type, entity, title: key } as unknown as PageDefinition;
}

function makeManifest(overrides: Partial<CellManifestV1['spec']> = {}): CellManifestV1 {
  return {
    version: '1.0',
    cellKey: 'test',
    spec: {
      entities: [],
      pages: [],
      navigation: { items: [] },
      mount: { landingPage: 'home' },
      ...overrides,
    },
  } as unknown as CellManifestV1;
}

function makeEntity(key: string, fields: unknown[] = []): EntityDefinition {
  return { key, label: key, fields, relations: [] } as unknown as EntityDefinition;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getManifestPages', () => {
  it('returns pages from spec', () => {
    const manifest = makeManifest({ pages: [makePage('list', '/customers')] });
    expect(getManifestPages(manifest)).toHaveLength(1);
  });

  it('returns [] when pages is absent', () => {
    const manifest = makeManifest({ pages: undefined as never });
    expect(getManifestPages(manifest)).toEqual([]);
  });
});

describe('findPageByKey', () => {
  it('returns the matching page', () => {
    const page = makePage('cust-list', '/customers');
    const manifest = makeManifest({ pages: [page] });
    expect(findPageByKey(manifest, 'cust-list')).toBe(page);
  });

  it('returns undefined when key not found', () => {
    const manifest = makeManifest({ pages: [] });
    expect(findPageByKey(manifest, 'missing')).toBeUndefined();
  });
});

describe('resolveLandingPath', () => {
  it('returns path of the landing page', () => {
    const manifest = makeManifest({
      pages: [makePage('home', '/home')],
      mount: { mountPath: '/app', landingPage: 'home' },
    });
    expect(resolveLandingPath(manifest)).toBe('/home');
  });

  it('returns "/" when landing page is not found', () => {
    const manifest = makeManifest({ pages: [], mount: { mountPath: '/app', landingPage: 'missing' } });
    expect(resolveLandingPath(manifest)).toBe('/');
  });
});

describe('getManifestRoutes', () => {
  it('returns routes from pages', () => {
    const manifest = makeManifest({ pages: [makePage('list', '/customers')] });
    const routes = getManifestRoutes(manifest);
    expect(routes).toHaveLength(1);
    expect(routes[0].pageKey).toBe('list');
    expect(routes[0].path).toBe('/customers');
  });

  it('appends /* for entity-detail pages', () => {
    const manifest = makeManifest({
      pages: [makePage('detail', '/customers/:id', 'entity-detail')],
    });
    const routes = getManifestRoutes(manifest);
    expect(routes[0].path).toBe('/customers/:id/*');
  });
});

describe('getManifestNavigation', () => {
  it('returns empty array when navigation has no items', () => {
    const manifest = makeManifest({ navigation: { items: [] } });
    expect(getManifestNavigation(manifest)).toEqual([]);
  });

  it('resolves page navigation items', () => {
    const manifest = makeManifest({
      pages: [makePage('cust-list', '/customers')],
      navigation: {
        items: [{ type: 'page', key: 'nav-customers', pageKey: 'cust-list', label: 'Customers', order: 1 }],
      },
    });
    const items = getManifestNavigation(manifest);
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('page');
    expect(items[0].path).toBe('/customers');
  });

  it('resolves group navigation items with children', () => {
    const manifest = makeManifest({
      pages: [makePage('cust-list', '/customers')],
      navigation: {
        items: [
          {
            type: 'group',
            key: 'crm',
            label: 'CRM',
            order: 0,
            children: [{ type: 'page', key: 'nav-cust', pageKey: 'cust-list', label: 'Customers', order: 0 }],
          },
        ],
      },
    });
    const items = getManifestNavigation(manifest);
    expect(items[0].type).toBe('group');
    expect(items[0].children).toHaveLength(1);
  });

  it('uses page title as label fallback', () => {
    const manifest = makeManifest({
      pages: [makePage('cust-list', '/customers')],
      navigation: {
        items: [{ type: 'page', key: 'nav-cust', pageKey: 'cust-list', order: 0 }],
      },
    });
    const items = getManifestNavigation(manifest);
    // label comes from page.title since item.label is absent
    expect(items[0].label).toBe('cust-list');
  });

  it('falls back to pageKey as label when label and page title are both absent', () => {
    const manifest = makeManifest({
      pages: [{ key: 'cust-list', path: '/customers', type: 'entity-list', entity: 'customer' } as unknown as PageDefinition],
      navigation: {
        items: [{ type: 'page', key: 'nav-cust', pageKey: 'cust-list', order: 0 }],
      },
    });
    const items = getManifestNavigation(manifest);
    expect(items[0].label).toBe('cust-list');
  });

  it('uses item index as order when order is absent on page item', () => {
    const manifest = makeManifest({
      pages: [makePage('cust-list', '/customers')],
      navigation: {
        items: [{ type: 'page', key: 'nav-cust', pageKey: 'cust-list', label: 'Customers' }],
      },
    });
    const items = getManifestNavigation(manifest);
    expect(items[0].order).toBe(0);
  });

  it('uses item index as order when order is absent on group item', () => {
    const manifest = makeManifest({
      pages: [],
      navigation: {
        items: [{ type: 'group', key: 'g', label: 'Group', children: [] }],
      },
    });
    const items = getManifestNavigation(manifest);
    expect(items[0].order).toBe(0);
  });

  it('returns [] when navigation is absent from spec', () => {
    const manifest = makeManifest({ navigation: undefined as never });
    expect(getManifestNavigation(manifest)).toEqual([]);
  });

  it('sorts by order', () => {
    const manifest = makeManifest({
      pages: [],
      navigation: {
        items: [
          { type: 'group', key: 'b', label: 'B', order: 2, children: [] },
          { type: 'group', key: 'a', label: 'A', order: 1, children: [] },
        ],
      },
    });
    const items = getManifestNavigation(manifest);
    expect(items[0].key).toBe('a');
    expect(items[1].key).toBe('b');
  });
});

describe('findManifestEntity', () => {
  it('returns matching entity', () => {
    const entity = makeEntity('customer');
    const manifest = makeManifest({ entities: [entity] });
    expect(findManifestEntity(manifest, 'customer')).toBe(entity);
  });

  it('returns undefined when not found', () => {
    const manifest = makeManifest({ entities: [] });
    expect(findManifestEntity(manifest, 'missing')).toBeUndefined();
  });

  it('returns undefined when entities is absent from spec', () => {
    const manifest = makeManifest({ entities: undefined as never });
    expect(findManifestEntity(manifest, 'customer')).toBeUndefined();
  });
});

describe('resolveManifestEntityFromDefinition', () => {
  it('includes base entity fields in the fields array', () => {
    const entity = makeEntity('customer', [{ key: 'name', type: 'string', label: 'Name' }]);
    const resolved = resolveManifestEntityFromDefinition(entity);
    // Should have user fields + base fields (id, version, etc.)
    expect(resolved.fields.length).toBeGreaterThan(1);
  });

  it('includes createFields derived from fields', () => {
    const entity = makeEntity('customer', [{ key: 'name', type: 'string', label: 'Name', create: { visible: true } }]);
    const resolved = resolveManifestEntityFromDefinition(entity);
    expect(resolved.createFields).toBeDefined();
  });

  it('includes editFields derived from fields', () => {
    const entity = makeEntity('customer', []);
    const resolved = resolveManifestEntityFromDefinition(entity);
    expect(resolved.editFields).toBeDefined();
  });

  it('defaults relations/computed/capabilities to [] when absent', () => {
    const entity = { key: 'order', label: 'Order', fields: [] } as unknown as EntityDefinition;
    const resolved = resolveManifestEntityFromDefinition(entity);
    expect(resolved.relations).toEqual([]);
    expect(resolved.computed).toEqual([]);
    expect(resolved.capabilities).toEqual([]);
  });

  it('excludes fields with form.visible === false from formFields', () => {
    const entity = {
      key: 'customer',
      label: 'Customer',
      fields: [
        { key: 'name', type: 'string', label: 'Name' },
        { key: 'hidden', type: 'string', label: 'Hidden', form: { visible: false } },
      ],
    } as unknown as EntityDefinition;
    const resolved = resolveManifestEntityFromDefinition(entity);
    expect(resolved.formFields.some((f) => f.key === 'hidden')).toBe(false);
    expect(resolved.formFields.some((f) => f.key === 'name')).toBe(true);
  });
});

describe('resolveManifestEntity', () => {
  it('returns resolved entity for existing key', () => {
    const entity = makeEntity('customer');
    const manifest = makeManifest({ entities: [entity] });
    expect(resolveManifestEntity(manifest, 'customer')).toBeDefined();
  });

  it('returns undefined for missing key', () => {
    const manifest = makeManifest({ entities: [] });
    expect(resolveManifestEntity(manifest, 'missing')).toBeUndefined();
  });
});

describe('resolveManifestEntities', () => {
  it('returns resolved entities for all entities in manifest', () => {
    const manifest = makeManifest({ entities: [makeEntity('customer'), makeEntity('company')] });
    expect(resolveManifestEntities(manifest)).toHaveLength(2);
  });

  it('returns [] for manifest with no entities', () => {
    const manifest = makeManifest({ entities: [] });
    expect(resolveManifestEntities(manifest)).toEqual([]);
  });

  it('returns [] when entities is absent from spec', () => {
    const manifest = makeManifest({ entities: undefined as never });
    expect(resolveManifestEntities(manifest)).toEqual([]);
  });
});
