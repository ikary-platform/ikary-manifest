import type { RuntimeContext } from '@ikary-manifest/primitives';

export const MOCK_RUNTIME: RuntimeContext = {
  entity: {
    key: 'customer',
    label: 'Customer',
    fields: [
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'revenue', label: 'Revenue', type: 'number' },
    ],
  },
  record: {
    id: 'cust-001',
    name: 'ACME Corporation',
    email: 'contact@acme.com',
    status: 'active',
    revenue: 84200,
  },
  transportMode: 'fake',
  permissions: ['customer.view', 'customer.list', 'customer.create', 'customer.update'],
  actions: {
    navigate: (path: string) => console.log('[playground] navigate:', path),
    mutate: async (_entity: string, _payload: unknown) => {
      console.log('[playground] mutate:', _entity, _payload);
    },
    delete: async (_entity: string, _id: string) => {
      console.log('[playground] delete:', _entity, _id);
    },
  },
  ui: {
    notify: (message: string) => console.log('[playground] notify:', message),
    confirm: async (message: string) => {
      console.log('[playground] confirm:', message);
      return true;
    },
  },
};
