import type { RuntimeContext } from '../../registry/resolverRegistry';

// ── Deterministic hash ──────────────────────────────────────────────────────

function entityHash(workspaceId: string, entity: string): number {
  const key = `${workspaceId}:${entity}`;
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h) ^ key.charCodeAt(i);
  return Math.abs(h);
}

// ── Field fake value generators ────────────────────────────────────────────

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
  phone: ['+1 555 000 1001', '+1 555 000 1002', '+1 555 000 1003', '+1 555 000 1004'],
  website: ['https://acme.com', 'https://globex.com', 'https://initech.com'],
  industry: ['Manufacturing', 'Technology', 'Healthcare', 'Finance', 'Retail'],
  city: ['Springfield', 'Shelbyville', 'Portland', 'Riverside'],
  country: ['USA', 'Canada', 'UK', 'Germany'],
  status: ['active', 'inactive', 'pending'],
  street: ['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm Blvd'],
  postal_code: ['62701', '97201', '10001', '90210'],
  number: ['INV-1001', 'INV-1002', 'INV-1003', 'INV-1004', 'INV-1005'],
  due_date: ['2026-01-15', '2026-02-28', '2026-03-31', '2026-04-15'],
  created_at: [],
};

function fakeFieldValue(
  fieldKey: string,
  fieldType: string,
  enumValues: string[] | undefined,
  index: number,
  seed: number,
): unknown {
  const i = (index + seed) % 8;
  if (fieldType === 'enum' && enumValues?.length) {
    return enumValues[i % enumValues.length];
  }
  if (fieldType === 'boolean') return i % 2 === 0;
  if (fieldType === 'number') return (i + 1) * 10 + Math.floor(i * 3.7);
  if (fieldKey === 'created_at' || fieldKey === 'updated_at') {
    return new Date(Date.now() - i * 86_400_000).toISOString();
  }
  const pool = FIELD_FAKES[fieldKey];
  if (pool?.length) return pool[i % pool.length];
  return `${fieldKey.replace(/_/g, ' ')} ${index + 1}`;
}

// ── Event generation ────────────────────────────────────────────────────────

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
  'invoice.approved': (a) => `${a} approved invoice INV-${1000 + Math.floor(Math.random() * 900)}`,
  'invoice.sent': (a) => `${a} sent invoice to customer`,
  'payment.received': () => 'Payment received',
  'note.added': (a) => `${a} added a note`,
  'email.sent': (a) => `${a} sent an email`,
  'status.changed': (a) => `${a} changed the status`,
  'contact.added': (a) => `${a} added a contact`,
  'workflow.started': (a) => `${a} started a workflow`,
};

function generateFakeEvent(index: number, workspaceId: string): Record<string, unknown> {
  const type = EVENT_TYPES[index % EVENT_TYPES.length];
  const actor = EVENT_ACTORS[index % EVENT_ACTORS.length];
  const hoursAgo = index * 5 + index * 1.3;
  return {
    id: `evt-${workspaceId.slice(0, 4)}-${String(index + 1).padStart(3, '0')}`,
    type,
    entity: 'customer',
    entity_id: '',
    actor,
    message: EVENT_MESSAGES[type]?.(actor.name) ?? type,
    timestamp: new Date(Date.now() - hoursAgo * 3_600_000).toISOString(),
    metadata: {},
  };
}

// ── Seed sizes ──────────────────────────────────────────────────────────────

const DEFAULT_SEED_COUNT = 50;

function seedRecords(workspaceId: string, entity: string, context: RuntimeContext): Record<string, unknown>[] {
  const seed = entityHash(workspaceId, entity);
  const count = DEFAULT_SEED_COUNT;

  if (entity === 'event') {
    return Array.from({ length: count }, (_, i) => generateFakeEvent(i, workspaceId));
  }

  const schemaFields = context.entity?.key === entity ? context.entity.fields : [];

  return Array.from({ length: count }, (_, i) => {
    const record: Record<string, unknown> = {
      id: `${entity}-${workspaceId.slice(0, 4)}-${String(i + 1).padStart(3, '0')}`,
    };
    if (schemaFields.length > 0) {
      for (const f of schemaFields) {
        record[f.key] = fakeFieldValue(f.key, f.type, (f as { enumValues?: string[] }).enumValues, i, seed);
      }
    } else {
      record.name = `${entity.replace(/_/g, ' ')} ${i + 1}`;
      record.status = ['active', 'pending', 'done', 'cancelled'][i % 4];
      record.created_at = new Date(Date.now() - i * 86_400_000).toISOString();
    }
    return record;
  });
}

// ── Module-level in-memory store ────────────────────────────────────────────

const store = new Map<string, Record<string, unknown>[]>();

function storeKey(workspaceId: string, entity: string): string {
  return `${workspaceId}::${entity}`;
}

export const fakeStore = {
  ensureEntity(workspaceId: string, entity: string, context: RuntimeContext): Record<string, unknown>[] {
    const key = storeKey(workspaceId, entity);
    if (!store.has(key)) {
      store.set(key, seedRecords(workspaceId, entity, context));
    }
    return store.get(key)!;
  },

  replaceEntity(workspaceId: string, entity: string, next: Record<string, unknown>[]): void {
    store.set(storeKey(workspaceId, entity), next);
  },

  clear(): void {
    store.clear();
  },
};
