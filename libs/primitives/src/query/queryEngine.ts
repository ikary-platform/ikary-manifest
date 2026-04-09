import type { RuntimeContext } from '../registry/resolverRegistry';
import type { EntityField } from '../types/EntityTypes';

export interface QueryDefinition {
  entity: string;
  mode?: 'list' | 'single';
  filter?: Record<string, unknown>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
  operation?: 'count' | 'sum' | 'avg';
  field?: string;
}

export interface QueryResult<T = Record<string, unknown>> {
  data: T[];
  total: number;
  value?: number;
}

// ── Fake data generation ──────────────────────────────────────────────────────

const FIELD_FAKES: Record<string, string[]> = {
  name: [
    'Acme Corp',
    'Globex Inc',
    'Initech LLC',
    'Umbrella Ltd',
    'Stark Industries',
    'Wayne Enterprises',
    'Hooli',
    'Pied Piper',
  ],
  email: ['alice@acme.com', 'bob@globex.com', 'carol@initech.com', 'dave@umbrella.com', 'eve@stark.com'],
  phone: ['+1 555 000 1001', '+1 555 000 1002', '+1 555 000 1003', '+1 555 000 1004', '+1 555 000 1005'],
  website: ['https://acme.com', 'https://globex.com', 'https://initech.com', 'https://umbrella.com'],
  industry: ['Manufacturing', 'Technology', 'Healthcare', 'Finance', 'Retail'],
  city: ['Springfield', 'Shelbyville', 'Portland', 'Riverside', 'Capital City'],
  country: ['USA', 'Canada', 'UK', 'Germany', 'France'],
  status: ['active', 'inactive', 'pending'],
  street: ['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm Blvd', '654 Maple Dr'],
  postal_code: ['62701', '97201', '10001', '90210', '60601'],
};

function fakeFieldValue(field: EntityField, index: number): unknown {
  if (field.type === 'enum' && field.enumValues?.length) {
    return field.enumValues[index % field.enumValues.length];
  }
  if (field.type === 'number') {
    return (index + 1) * 10 + Math.floor(index * 3.7);
  }
  const pool = FIELD_FAKES[field.key];
  if (pool) return pool[index % pool.length];
  return `${field.name} ${index + 1}`;
}

function generateFakeRecord(
  entity: string,
  index: number,
  fields: EntityField[],
  filterValues: Record<string, unknown>,
): Record<string, unknown> {
  const record: Record<string, unknown> = {
    id: `${entity}-${String(index + 1).padStart(3, '0')}`,
  };

  for (const field of fields) {
    record[field.key] = fakeFieldValue(field, index);
  }

  // Apply resolved filter constants (not binding objects)
  for (const [key, value] of Object.entries(filterValues)) {
    if (value !== undefined && value !== null) {
      record[key] = value;
    }
  }

  return record;
}

function genericFakeRecord(
  entity: string,
  index: number,
  filterValues: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id: `${entity}-${String(index + 1).padStart(3, '0')}`,
    name: `${entity.replace(/_/g, ' ')} ${index + 1}`,
    status: ['active', 'pending', 'done', 'cancelled'][index % 4],
    created_at: new Date(Date.now() - index * 86_400_000).toISOString().split('T')[0],
    ...filterValues,
  };
}

// ── Activity event generation ─────────────────────────────────────────────────

const EVENT_TYPES = [
  'customer.created',
  'customer.updated',
  'invoice.approved',
  'invoice.sent',
  'payment.received',
  'note.added',
  'email.sent',
  'status.changed',
  'contact.added',
  'workflow.started',
];

const EVENT_ACTORS = [
  { id: 'usr-01', name: 'Pierre' },
  { id: 'usr-02', name: 'Alice' },
  { id: 'usr-03', name: 'Bob' },
  { id: 'system', name: 'System' },
  { id: 'usr-04', name: 'Carol' },
];

const EVENT_MESSAGES: Record<string, (actor: string) => string> = {
  'customer.created': (a) => `${a} created this customer`,
  'customer.updated': (a) => `${a} updated customer details`,
  'invoice.approved': (a) => `${a} approved invoice INV-${1000 + (crypto.getRandomValues(new Uint32Array(1))[0]! % 900)}`,
  'invoice.sent': (a) => `${a} sent invoice to customer`,
  'payment.received': () => `Payment received`,
  'note.added': (a) => `${a} added a note`,
  'email.sent': (a) => `${a} sent an email`,
  'status.changed': (a) => `${a} changed the status`,
  'contact.added': (a) => `${a} added a contact`,
  'workflow.started': (a) => `${a} started a workflow`,
};

function generateFakeEvent(index: number, filterValues: Record<string, unknown>): Record<string, unknown> {
  const type = EVENT_TYPES[index % EVENT_TYPES.length];
  const actor = EVENT_ACTORS[index % EVENT_ACTORS.length];
  const hoursAgo = index * 5 + index * 1.3;
  return {
    id: `evt-${String(index + 1).padStart(3, '0')}`,
    type,
    entity: filterValues.entity ?? 'customer',
    entity_id: filterValues.entity_id ?? '',
    actor,
    message: EVENT_MESSAGES[type]?.(actor.name) ?? type,
    timestamp: new Date(Date.now() - hoursAgo * 3_600_000).toISOString(),
    metadata: {},
    ...filterValues,
  };
}

// ── Aggregate helpers ─────────────────────────────────────────────────────────

function entityHash(entity: string, filter: Record<string, unknown>): number {
  const key = `${entity}:${JSON.stringify(filter)}`;
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h) ^ key.charCodeAt(i);
  return Math.abs(h);
}
function fakeCount(entity: string, filter: Record<string, unknown>): number {
  return (entityHash(entity, filter) % 5000) + 50;
}
function fakeSum(entity: string, field: string, filter: Record<string, unknown>): number {
  return (entityHash(entity, { ...filter, __f: field }) % 900_000) + 10_000;
}
function fakeAvg(entity: string, field: string, filter: Record<string, unknown>): number {
  return (entityHash(entity, { ...filter, __f: field }) % 9_000) / 10 + 10;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function runQuery(context: RuntimeContext, query: QueryDefinition): Promise<QueryResult> {
  if (query.operation) {
    await new Promise((r) => setTimeout(r, 80 + (crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000) * 120));
    const filter = query.filter ?? {};
    let value: number;
    switch (query.operation) {
      case 'sum':
        value = fakeSum(query.entity, query.field ?? 'amount', filter);
        break;
      case 'avg':
        value = fakeAvg(query.entity, query.field ?? 'amount', filter);
        break;
      default:
        value = fakeCount(query.entity, filter);
    }
    return { data: [], total: 0, value };
  }

  // Simulate network latency
  await new Promise((r) => setTimeout(r, 120 + (crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000) * 180));

  const count = query.limit ?? 10;
  const filter = query.filter ?? {};

  const isEventQuery = query.entity === 'event';
  const useSchema = !isEventQuery && context.entity.key === query.entity && context.entity.fields.length > 0;

  const data = Array.from({ length: count }, (_, i) =>
    isEventQuery
      ? generateFakeEvent(i, filter)
      : useSchema
        ? generateFakeRecord(query.entity, i, context.entity.fields, filter)
        : genericFakeRecord(query.entity, i, filter),
  );

  if (query.sort) {
    const { field, direction } = query.sort;
    data.sort((a, b) => {
      const av = String(a[field] ?? '');
      const bv = String(b[field] ?? '');
      return direction === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }

  return { data, total: count * 3 };
}
