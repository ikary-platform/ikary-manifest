/** Minimal valid CellManifestV1 — satisfies all required fields and semantic rules. */
export const MINIMAL_MANIFEST = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: {
    key: 'e2e_test',
    name: 'E2E Test Cell',
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
    entities: [],
  },
} as const;

/** Minimal valid EntityDefinition — required fields only. */
export const MINIMAL_ENTITY = {
  key: 'product',
  name: 'Product',
  pluralName: 'Products',
  fields: [{ key: 'name', type: 'string', name: 'Name' }],
} as const;

/** Minimal valid PageDefinition — dashboard type requires no entity binding. */
export const MINIMAL_PAGE = {
  key: 'overview',
  type: 'dashboard',
  title: 'Overview',
  path: '/overview',
} as const;

/** Invalid manifest for negative validation tests. */
export const INVALID_MANIFEST = {
  apiVersion: 'wrong/version',
  kind: 'NotACell',
} as const;

/** Sample validation errors for the explain-errors endpoint / tool. */
export const SAMPLE_ERRORS = [
  { field: 'spec.entities', message: 'entity keys must be unique' },
] as const;

/** Entity pairs used to test suggest-relations (order has a customer_id field). */
export const RELATION_ENTITIES = [
  { key: 'order', fields: ['customer_id', 'total'] },
  { key: 'customer' },
] as const;
