import { describe, it, expect } from 'vitest';
import { validateBusinessRules } from './validate-manifest-semantics';
import type { CellManifestV1 } from '../shared/types';

const baseManifest: CellManifestV1 = {
  apiVersion: 'ikary.io/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'test', name: 'Test Cell', version: '1.0.0' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    pages: [{ key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' }],
    entities: [],
    navigation: { items: [] },
  },
};

describe('validateBusinessRules', () => {
  it('returns no errors for a valid manifest', () => {
    const errors = validateBusinessRules(baseManifest);
    expect(errors).toHaveLength(0);
  });

  it('rejects duplicate page keys', () => {
    const manifest: CellManifestV1 = {
      ...baseManifest,
      spec: {
        ...baseManifest.spec,
        pages: [
          { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
          { key: 'dashboard', type: 'custom', title: 'Other', path: '/other' },
        ],
      },
    };
    const errors = validateBusinessRules(manifest);
    expect(errors.some((e) => e.message.includes('Duplicate page key'))).toBe(true);
  });

  it('rejects invalid landingPage reference', () => {
    const manifest: CellManifestV1 = {
      ...baseManifest,
      spec: { ...baseManifest.spec, mount: { ...baseManifest.spec.mount, landingPage: 'nonexistent' } },
    };
    const errors = validateBusinessRules(manifest);
    expect(errors.some((e) => e.field === 'spec.mount.landingPage')).toBe(true);
  });

  it('rejects entity-list page without entity', () => {
    const manifest: CellManifestV1 = {
      ...baseManifest,
      spec: {
        ...baseManifest.spec,
        pages: [
          { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
          { key: 'list', type: 'entity-list', title: 'List', path: '/list' },
        ],
      },
    };
    const errors = validateBusinessRules(manifest);
    expect(errors.some((e) => e.field.includes('entity'))).toBe(true);
  });

  it('rejects enum field without enumValues', () => {
    const manifest: CellManifestV1 = {
      ...baseManifest,
      spec: {
        ...baseManifest.spec,
        entities: [
          {
            key: 'ticket',
            name: 'Ticket',
            pluralName: 'Tickets',
            fields: [{ key: 'status', type: 'enum', name: 'Status' }],
          },
        ],
      },
    };
    const errors = validateBusinessRules(manifest);
    expect(errors.some((e) => e.message.includes('enumValues'))).toBe(true);
  });

  it('rejects page path not starting with /', () => {
    const manifest: CellManifestV1 = {
      ...baseManifest,
      spec: {
        ...baseManifest.spec,
        pages: [{ key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: 'dashboard' }],
      },
    };
    const errors = validateBusinessRules(manifest);
    expect(errors.some((e) => e.message.includes('must start with'))).toBe(true);
  });

  it('rejects a field key that conflicts with a base entity field', () => {
    const manifest: CellManifestV1 = {
      ...baseManifest,
      spec: {
        ...baseManifest.spec,
        entities: [
          {
            key: 'ticket',
            name: 'Ticket',
            pluralName: 'Tickets',
            fields: [
              { key: 'subject', type: 'string', name: 'Subject' },
              { key: 'createdAt', type: 'datetime', name: 'Created At' },
            ],
          },
        ],
      },
    };
    const errors = validateBusinessRules(manifest);
    expect(errors.some((e) => e.message.includes('"createdAt" is reserved'))).toBe(true);
  });

  it('rejects base field keys declared on all reserved names', () => {
    const reservedKeys = ['id', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'deletedAt', 'version'];
    for (const key of reservedKeys) {
      const manifest: CellManifestV1 = {
        ...baseManifest,
        spec: {
          ...baseManifest.spec,
          entities: [
            {
              key: 'ticket',
              name: 'Ticket',
              pluralName: 'Tickets',
              fields: [{ key, type: 'string', name: key }],
            },
          ],
        },
      };
      const errors = validateBusinessRules(manifest);
      expect(errors.some((e) => e.message.includes(`"${key}" is reserved`))).toBe(true);
    }
  });

  it('rejects fieldPolicies key that does not reference a declared field', () => {
    const manifest: CellManifestV1 = {
      ...baseManifest,
      spec: {
        ...baseManifest.spec,
        entities: [
          {
            key: 'invoice',
            name: 'Invoice',
            pluralName: 'Invoices',
            fields: [{ key: 'status', type: 'string', name: 'Status' }],
            fieldPolicies: {
              nonexistent_field: { view: { scope: 'role' } },
            },
          },
        ],
      },
    };
    const errors = validateBusinessRules(manifest);
    expect(errors.some((e) => e.message.includes('does not reference a declared field key'))).toBe(true);
  });

  it('rejects fieldPolicies key that conflicts with a reserved base entity field', () => {
    const manifest: CellManifestV1 = {
      ...baseManifest,
      spec: {
        ...baseManifest.spec,
        entities: [
          {
            key: 'invoice',
            name: 'Invoice',
            pluralName: 'Invoices',
            fields: [{ key: 'status', type: 'string', name: 'Status' }],
            fieldPolicies: {
              createdAt: { view: { scope: 'role' } },
            },
          },
        ],
      },
    };
    const errors = validateBusinessRules(manifest);
    expect(errors.some((e) => e.message.includes('conflicts with a reserved base entity field key'))).toBe(true);
  });

  it('rejects duplicate role keys', () => {
    const manifest: CellManifestV1 = {
      ...baseManifest,
      spec: {
        ...baseManifest.spec,
        roles: [
          { key: 'admin', name: 'Admin', scopes: ['system.admin'] },
          { key: 'admin', name: 'Admin 2', scopes: ['system.view'] },
        ],
      },
    };
    const errors = validateBusinessRules(manifest);
    expect(errors.some((e) => e.message.includes('Duplicate role key'))).toBe(true);
  });

  it('rejects role with empty scopes array', () => {
    const manifest: CellManifestV1 = {
      ...baseManifest,
      spec: {
        ...baseManifest.spec,
        roles: [{ key: 'empty-role', name: 'Empty Role', scopes: [] }],
      },
    };
    const errors = validateBusinessRules(manifest);
    expect(errors.some((e) => e.message.includes('must declare at least one scope'))).toBe(true);
  });
});
