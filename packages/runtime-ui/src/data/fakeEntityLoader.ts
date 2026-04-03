import type { EntitySchema } from '../types/EntityTypes';

// ── Fake schemas ──────────────────────────────────────────────────────────────

const FAKE_SCHEMAS: Record<string, EntitySchema> = {
  customer: {
    key: 'customer',
    name: 'Customer',
    pluralName: 'Customers',
    fields: [
      { key: 'name', name: 'Name', type: 'string' },
      { key: 'email', name: 'Email', type: 'string' },
      { key: 'phone', name: 'Phone', type: 'string' },
      { key: 'website', name: 'Website', type: 'string' },
      { key: 'industry', name: 'Industry', type: 'string' },
      { key: 'street', name: 'Street', type: 'string' },
      { key: 'city', name: 'City', type: 'string' },
      { key: 'postal_code', name: 'Postal Code', type: 'string' },
      { key: 'country', name: 'Country', type: 'string' },
      { key: 'vat_number', name: 'VAT Number', type: 'string' },
      { key: 'payment_terms_days', name: 'Payment Terms (Days)', type: 'number' },
      { key: 'account_owner_id', name: 'Account Owner ID', type: 'string' },
      { key: 'status', name: 'Status', type: 'enum', enumValues: ['active', 'inactive', 'suspended'] },
    ],
  },
  invoice: {
    key: 'invoice',
    name: 'Invoice',
    pluralName: 'Invoices',
    fields: [
      { key: 'number', name: 'Number', type: 'string' },
      { key: 'amount', name: 'Amount', type: 'number' },
      { key: 'due_date', name: 'Due Date', type: 'string' },
      { key: 'customer_id', name: 'Customer ID', type: 'string' },
      { key: 'status', name: 'Status', type: 'enum', enumValues: ['draft', 'sent', 'paid', 'overdue'] },
    ],
  },
  contact: {
    key: 'contact',
    name: 'Contact',
    pluralName: 'Contacts',
    fields: [
      { key: 'name', name: 'Name', type: 'string' },
      { key: 'email', name: 'Email', type: 'string' },
      { key: 'role', name: 'Role', type: 'string' },
      { key: 'customer_id', name: 'Customer ID', type: 'string' },
    ],
  },
};

// ── Fake records ──────────────────────────────────────────────────────────────

const FAKE_RECORDS: Record<string, Record<string, unknown>> = {
  'customer:cust-001': {
    id: 'cust-001',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+1 555 000 1234',
    website: 'https://acme.com',
    industry: 'Manufacturing',
    street: '123 Main St',
    city: 'Springfield',
    postal_code: '62701',
    country: 'USA',
    vat_number: 'US123456789',
    payment_terms_days: 30,
    account_owner_id: 'usr_01HZ',
    status: 'active',
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

export async function loadFakeSchema(entity: string): Promise<EntitySchema> {
  await new Promise((r) => setTimeout(r, 40 + Math.random() * 40));
  return (
    FAKE_SCHEMAS[entity] ?? {
      key: entity,
      name: entity.charAt(0).toUpperCase() + entity.slice(1),
      pluralName: `${entity}s`,
      fields: [
        { key: 'name', name: 'Name', type: 'string' },
        { key: 'status', name: 'Status', type: 'string' },
      ],
    }
  );
}

export async function loadFakeRecord(entity: string, id: string): Promise<Record<string, unknown>> {
  await new Promise((r) => setTimeout(r, 60 + Math.random() * 80));
  return (
    FAKE_RECORDS[`${entity}:${id}`] ?? {
      id,
      name: `${entity.charAt(0).toUpperCase() + entity.slice(1)} ${id}`,
      status: 'active',
    }
  );
}
