import type { EntityDefinition, FieldDefinition } from '@ikary/contract';

const FIRST_NAMES = [
  'James', 'Maria', 'David', 'Sarah', 'Michael',
  'Emma', 'Robert', 'Olivia', 'Daniel', 'Sophia',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Martinez', 'Anderson',
];

const COMPANIES = [
  'Acme Corp', 'Globex Inc', 'Stark Industries', 'Wayne Enterprises',
  'Umbrella Corp', 'Cyberdyne Systems', 'Weyland-Yutani', 'Soylent Corp',
  'Tyrell Corp', 'Oscorp',
];

const CITIES = [
  'New York', 'London', 'Tokyo', 'Paris', 'Sydney',
  'Toronto', 'Berlin', 'Singapore', 'Dubai', 'San Francisco',
];

function generateFieldValue(field: FieldDefinition, index: number): unknown {
  const key = field.key;

  switch (field.type) {
    case 'string': {
      if (/name|full.?name/i.test(key))
        return `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[index % LAST_NAMES.length]}`;
      if (/first.?name/i.test(key))
        return FIRST_NAMES[index % FIRST_NAMES.length];
      if (/last.?name/i.test(key))
        return LAST_NAMES[index % LAST_NAMES.length];
      if (/email/i.test(key))
        return `user${index + 1}@example.com`;
      if (/phone/i.test(key))
        return `+1-555-0${String(100 + index).padStart(3, '0')}`;
      if (/company/i.test(key))
        return COMPANIES[index % COMPANIES.length];
      if (/city/i.test(key))
        return CITIES[index % CITIES.length];
      if (/url|website/i.test(key))
        return `https://example.com/page-${index + 1}`;
      if (/title|subject/i.test(key))
        return `Sample ${field.name || field.key} ${index + 1}`;
      return `${field.key}_${index + 1}`;
    }

    case 'text':
      return `Sample ${field.name || field.key} content for record ${index + 1}. This is generated test data.`;

    case 'number': {
      const r = crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000;
      if (/revenue|amount|price|cost/i.test(key))
        return Math.round(r * 100000 * 100) / 100;
      return crypto.getRandomValues(new Uint32Array(1))[0]! % 1000;
    }

    case 'boolean':
      return index % 3 !== 0;

    case 'date':
      return new Date(
        Date.now() - (crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000) * 365 * 86400000,
      )
        .toISOString()
        .split('T')[0];

    case 'datetime':
      return new Date(
        Date.now() - (crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000) * 365 * 86400000,
      ).toISOString();

    case 'enum': {
      const enumValues = (field as any).enumValues as
        | string[]
        | { key: string }[]
        | undefined;
      if (!enumValues || enumValues.length === 0) return null;
      const picked = enumValues[index % enumValues.length];
      return typeof picked === 'object' && picked !== null ? picked.key : picked;
    }

    case 'object': {
      const children = (field as any).fields as FieldDefinition[] | undefined;
      if (!children || children.length === 0) return {};
      const obj: Record<string, unknown> = {};
      for (const child of children) {
        obj[child.key] = generateFieldValue(child, index);
      }
      return obj;
    }

    default:
      return `${field.key}_${index + 1}`;
  }
}

export function generateSeedRecords(
  entity: EntityDefinition,
  count: number,
): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];

  for (let i = 0; i < count; i++) {
    const record: Record<string, unknown> = {
      id: crypto.randomUUID(),
      createdAt: new Date(
        Date.now() - (crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000) * 90 * 86400000,
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - (crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000) * 90 * 86400000,
      ).toISOString(),
      createdBy: 'seed-generator',
      updatedBy: 'seed-generator',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    };

    for (const field of entity.fields) {
      record[field.key] = generateFieldValue(field, i);
    }

    if (entity.lifecycle) {
      record[entity.lifecycle.field] = entity.lifecycle.initial;
    }

    records.push(record);
  }

  return records;
}
