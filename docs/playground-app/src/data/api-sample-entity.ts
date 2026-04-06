import type { EntityDefinition } from '@ikary-manifest/contract';

export const SAMPLE_ENTITY: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    {
      key: 'name',
      label: 'Full Name',
      type: 'string',
      required: true,
      helpText: 'The customer display name',
    },
    {
      key: 'email',
      label: 'Email Address',
      type: 'string',
      form: { placeholder: 'name@example.com' },
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      enumValues: [
        { key: 'active', label: 'Active' },
        { key: 'inactive', label: 'Inactive' },
        { key: 'archived', label: 'Archived' },
      ],
    },
    {
      key: 'revenue',
      label: 'Annual Revenue',
      type: 'number',
      create: { visible: false },
    },
    {
      key: 'notes',
      label: 'Notes',
      type: 'string',
      form: { placeholder: 'Internal notes…' },
      create: { order: 99 },
    },
  ],
  capabilities: [
    {
      key: 'archive',
      type: 'workflow',
      workflow: 'archive-customer',
    },
    {
      key: 'export',
      type: 'workflow',
      workflow: 'export-records',
      scope: 'global.export',
    },
  ],
  lifecycle: {
    transitions: [
      {
        key: 'activate',
        from: ['inactive'],
        to: 'active',
        label: 'Activate',
      },
      {
        key: 'deactivate',
        from: ['active'],
        to: 'inactive',
        label: 'Deactivate',
      },
    ],
  },
} as unknown as EntityDefinition;

export const SAMPLE_ENTITY_JSON = JSON.stringify(SAMPLE_ENTITY, null, 2);
