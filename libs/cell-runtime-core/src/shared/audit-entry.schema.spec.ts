import { describe, it, expect } from 'vitest';
import { auditEntrySchema } from './audit-entry.schema.js';

const VALID_ENTRY = {
  entityKey: 'customer',
  entityId: 'uuid-123',
  eventType: 'entity.created',
  resourceVersion: 1,
  changeKind: 'snapshot' as const,
  snapshot: { name: 'Acme' },
};

describe('auditEntrySchema', () => {
  it('parses a valid entry', () => {
    expect(() => auditEntrySchema.parse(VALID_ENTRY)).not.toThrow();
  });

  it('accepts changeKind "patch"', () => {
    expect(() => auditEntrySchema.parse({ ...VALID_ENTRY, changeKind: 'patch' })).not.toThrow();
  });

  it('accepts changeKind "rollback"', () => {
    expect(() => auditEntrySchema.parse({ ...VALID_ENTRY, changeKind: 'rollback' })).not.toThrow();
  });

  it('rejects an invalid changeKind', () => {
    expect(() => auditEntrySchema.parse({ ...VALID_ENTRY, changeKind: 'invalid' })).toThrow();
  });

  it('accepts diff: null', () => {
    const result = auditEntrySchema.parse({ ...VALID_ENTRY, diff: null });
    expect(result.diff).toBeNull();
  });

  it('accepts diff as an object', () => {
    const result = auditEntrySchema.parse({ ...VALID_ENTRY, diff: { name: { before: 'A', after: 'B' } } });
    expect(result.diff).toBeDefined();
  });

  it('omitted diff defaults to undefined', () => {
    const result = auditEntrySchema.parse(VALID_ENTRY);
    expect(result.diff).toBeUndefined();
  });

  it('rejects resourceVersion of 0 (must be positive)', () => {
    expect(() => auditEntrySchema.parse({ ...VALID_ENTRY, resourceVersion: 0 })).toThrow();
  });

  it('rejects missing entityKey', () => {
    const { entityKey: _removed, ...rest } = VALID_ENTRY;
    expect(() => auditEntrySchema.parse(rest)).toThrow();
  });
});
