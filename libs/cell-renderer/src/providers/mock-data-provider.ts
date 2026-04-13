import type { FieldType } from '@ikary/cell-contract';
import type { ManifestRuntimeEntity } from '../manifest/selectors';

export interface MockDataProvider {
  getRows(entity: ManifestRuntimeEntity, count?: number): Record<string, unknown>[];
  getOne(entity: ManifestRuntimeEntity): Record<string, unknown>;
  create(entity: ManifestRuntimeEntity, data: Record<string, unknown>): Record<string, unknown>;
}

const SAMPLE_STRINGS: Record<string, string[]> = {
  subject: [
    'Login issue',
    'Cannot export data',
    'UI broken on mobile',
    'Password reset not working',
    'Feature request: dark mode',
  ],
  name: ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown', 'Eve Davis'],
  email: ['alice@example.com', 'bob@example.com', 'carol@example.com', 'david@example.com', 'eve@example.com'],
  title: ['Project Alpha', 'Q4 Review', 'Onboarding', 'Migration Plan', 'Security Audit'],
};

function mockValue(fieldKey: string, type: FieldType, enumValues?: string[], index = 0): unknown {
  switch (type) {
    case 'boolean':
      return index % 2 === 0;
    case 'number':
      return (index + 1) * 10;
    case 'date':
      return new Date(Date.now() - index * 86400000).toISOString().split('T')[0];
    case 'datetime':
      return new Date(Date.now() - index * 86400000).toISOString();
    case 'enum':
      return enumValues?.[index % (enumValues.length || 1)] ?? 'unknown';
    case 'text':
      return `Sample text for ${fieldKey} row ${index + 1}`;
    case 'string':
    default: {
      const samples = SAMPLE_STRINGS[fieldKey];
      if (samples) return samples[index % samples.length];
      return `${fieldKey}-${index + 1}`;
    }
  }
}

function buildRecord(entity: ManifestRuntimeEntity, index: number): Record<string, unknown> {
  const record: Record<string, unknown> = { id: `${entity.key}-${index + 1}` };
  for (const field of entity.fields) {
    record[field.key] = mockValue(field.key, field.type, field.enumValues, index);
  }
  return record;
}

/** Generates `count` seed records for an entity. Used to initialise the in-memory data store. */
export function generateMockRows(entity: ManifestRuntimeEntity, count = 5): Record<string, unknown>[] {
  return Array.from({ length: count }, (_, i) => buildRecord(entity, i));
}

export function createMockDataProvider(): MockDataProvider {
  const cache = new Map<string, Record<string, unknown>[]>();
  let counter = 1000;

  return {
    getRows(entity: ManifestRuntimeEntity, count = 5): Record<string, unknown>[] {
      const key = `${entity.key}-${count}`;
      if (!cache.has(key)) {
        cache.set(
          key,
          Array.from({ length: count }, (_, i) => buildRecord(entity, i)),
        );
      }
      return cache.get(key)!;
    },
    getOne(entity: ManifestRuntimeEntity): Record<string, unknown> {
      return buildRecord(entity, 0);
    },
    create(entity: ManifestRuntimeEntity, data: Record<string, unknown>): Record<string, unknown> {
      const id = String(++counter);
      return { id, ...data };
    },
  };
}
