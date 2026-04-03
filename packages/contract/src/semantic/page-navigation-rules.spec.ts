import { describe, expect, it } from 'vitest';
import type { CellManifestV1, NavigationItem } from '../shared/types';
import { validateNavigationRules } from './navigation-rules';
import { validatePageRules } from './page-rules';

function makeManifest(): CellManifestV1 {
  return {
    apiVersion: 'ikary.io/v1alpha1',
    kind: 'Cell',
    metadata: {
      key: 'customer-cell',
      name: 'Customer Cell',
      version: '1.0.0',
    },
    spec: {
      mount: {
        mountPath: '/',
        landingPage: 'dashboard',
      },
      pages: [
        {
          key: 'dashboard',
          type: 'dashboard',
          title: 'Dashboard',
          path: '/dashboard',
        },
      ],
      entities: [
        {
          key: 'customer',
          name: 'Customer',
          pluralName: 'Customers',
          fields: [{ key: 'name', type: 'string', name: 'Name' }],
        },
      ],
    },
  };
}

describe('validatePageRules', () => {
  it('handles missing optional pages/entities arrays', () => {
    const manifest: CellManifestV1 = {
      apiVersion: 'ikary.io/v1alpha1',
      kind: 'Cell',
      metadata: {
        key: 'no-pages',
        name: 'No Pages',
        version: '1.0.0',
      },
      spec: {
        mount: {
          mountPath: '/',
          landingPage: 'dashboard',
        },
      },
    };

    const errors = validatePageRules(manifest);
    expect(errors.some((error) => error.message.includes('landingPage "dashboard"'))).toBe(true);
  });

  it('detects duplicate keys/paths and entity page invariants', () => {
    const manifest = makeManifest();
    manifest.spec.mount.landingPage = 'missing-page';
    manifest.spec.pages = [
      { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
      { key: 'dashboard', type: 'custom', title: 'Duplicate Key', path: '/duplicate-key' },
      { key: 'duplicate-path-a', type: 'custom', title: 'A', path: '/duplicate-path' },
      { key: 'duplicate-path-b', type: 'custom', title: 'B', path: '/duplicate-path' },
      { key: 'missing-entity', type: 'entity-list', title: 'Missing Entity', path: '/missing' },
      {
        key: 'unknown-entity',
        type: 'entity-list',
        title: 'Unknown Entity',
        path: '/unknown',
        entity: 'not-declared',
      },
      {
        key: 'customer-list-a',
        type: 'entity-list',
        title: 'Customer List A',
        path: '/customers/a',
        entity: 'customer',
      },
      {
        key: 'customer-list-b',
        type: 'entity-list',
        title: 'Customer List B',
        path: '/customers/b',
        entity: 'customer',
      },
      { key: 'bad-path', type: 'dashboard', title: 'Bad Path', path: 'bad-path' },
    ];

    const errors = validatePageRules(manifest);
    const messages = errors.map((error) => error.message);

    expect(messages.some((message) => message.includes('Duplicate page key'))).toBe(true);
    expect(messages.some((message) => message.includes('Duplicate entity key'))).toBe(false);
    expect(messages.some((message) => message.includes('Duplicate page path'))).toBe(true);
    expect(messages.some((message) => message.includes('must start with "/"'))).toBe(true);
    expect(messages.some((message) => message.includes('landingPage "missing-page"'))).toBe(true);
    expect(messages.some((message) => message.includes('requires an entity key'))).toBe(true);
    expect(messages.some((message) => message.includes('unknown entity key'))).toBe(true);
    expect(messages.some((message) => message.includes('Only one is allowed per entity'))).toBe(true);
  });

  it('detects duplicate entity keys', () => {
    const manifest = makeManifest();
    manifest.spec.entities = [
      {
        key: 'customer',
        name: 'Customer',
        pluralName: 'Customers',
        fields: [{ key: 'name', type: 'string', name: 'Name' }],
      },
      {
        key: 'customer',
        name: 'Customer Duplicate',
        pluralName: 'Customers Duplicate',
        fields: [{ key: 'label', type: 'string', name: 'Label' }],
      },
    ];

    const errors = validatePageRules(manifest);
    expect(errors.some((error) => error.message.includes('Duplicate entity key'))).toBe(true);
  });

  it('returns no errors for valid page declarations', () => {
    const manifest = makeManifest();
    manifest.spec.pages = [
      { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
      {
        key: 'customer-list',
        type: 'entity-list',
        title: 'Customers',
        path: '/customers',
        entity: 'customer',
      },
      {
        key: 'customer-detail',
        type: 'entity-detail',
        title: 'Customer Detail',
        path: '/customers/:id',
        entity: 'customer',
      },
      {
        key: 'customer-create',
        type: 'entity-create',
        title: 'Create Customer',
        path: '/customers/new',
        entity: 'customer',
      },
      {
        key: 'customer-edit',
        type: 'entity-edit',
        title: 'Edit Customer',
        path: '/customers/:id/edit',
        entity: 'customer',
      },
    ];

    expect(validatePageRules(manifest)).toEqual([]);
  });
});

describe('validateNavigationRules', () => {
  it('handles missing optional navigation array input', () => {
    expect(validateNavigationRules(undefined as unknown as NavigationItem[], new Set())).toEqual([]);
  });

  it('detects duplicate navigation keys and unknown page refs', () => {
    const items: NavigationItem[] = [
      { type: 'page', key: 'dashboard', pageKey: 'dashboard' },
      {
        type: 'group',
        key: 'dashboard',
        label: 'Group',
        children: [{ type: 'page', key: 'missing', pageKey: 'missing-page' }],
      },
    ];

    const errors = validateNavigationRules(items, new Set(['dashboard']));
    const messages = errors.map((error) => error.message);

    expect(messages.some((message) => message.includes('Duplicate navigation key'))).toBe(true);
    expect(messages.some((message) => message.includes('unknown page key'))).toBe(true);
  });

  it('returns no errors for valid navigation trees', () => {
    const items: NavigationItem[] = [
      { type: 'page', key: 'dashboard', pageKey: 'dashboard' },
      {
        type: 'group',
        key: 'customers',
        label: 'Customers',
        children: [{ type: 'page', key: 'list', pageKey: 'customer-list' }],
      },
    ];

    expect(validateNavigationRules(items, new Set(['dashboard', 'customer-list']))).toEqual([]);
  });
});
