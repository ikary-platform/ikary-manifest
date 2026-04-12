import type { RuntimeContext } from '@ikary/primitives';

export const MOCK_RUNTIME: RuntimeContext = {
  entity: {
    key: 'customer',
    name: 'Customer',
    pluralName: 'Customers',
    fields: [
      { key: 'name', name: 'Name', label: 'Name', type: 'string' },
      { key: 'email', name: 'Email', label: 'Email', type: 'string' },
      { key: 'status', name: 'Status', label: 'Status', type: 'enum' },
      { key: 'revenue', name: 'Revenue', label: 'Revenue', type: 'number' },
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
