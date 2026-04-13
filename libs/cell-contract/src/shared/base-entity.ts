import type { FieldDefinition } from './types';

/**
 * Canonical base fields injected into every Cell entity by the compiler.
 * All fields are system-managed (system: true, readonly: true) and cannot
 * be declared in a manifest — the compiler rejects duplicate keys.
 */
export const BASE_ENTITY_FIELDS: FieldDefinition[] = [
  { key: 'id', type: 'string', name: 'ID', system: true, readonly: true },
  {
    key: 'createdAt',
    type: 'datetime',
    name: 'Created At',
    system: true,
    readonly: true,
    list: { visible: true, sortable: true },
  },
  { key: 'createdBy', type: 'string', name: 'Created By', system: true, readonly: true },
  { key: 'updatedAt', type: 'datetime', name: 'Updated At', system: true, readonly: true },
  { key: 'updatedBy', type: 'string', name: 'Updated By', system: true, readonly: true },
  { key: 'deletedAt', type: 'datetime', name: 'Deleted At', system: true, readonly: true },
  { key: 'deletedBy', type: 'string', name: 'Deleted By', system: true, readonly: true },
  { key: 'version', type: 'number', name: 'Version', system: true, readonly: true },
];

/** Set of keys reserved by the base entity — used in business-rules validation. */
export const BASE_ENTITY_FIELD_KEYS = new Set(BASE_ENTITY_FIELDS.map((f) => f.key));
