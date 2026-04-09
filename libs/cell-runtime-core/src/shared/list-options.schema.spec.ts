import { describe, it, expect } from 'vitest';
import { listOptionsSchema } from './list-options.schema.js';

describe('listOptionsSchema', () => {
  it('applies all defaults when given an empty object', () => {
    const result = listOptionsSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.sort).toBe('created_at');
    expect(result.order).toBe('desc');
    expect(result.includeDeleted).toBe(false);
  });

  it('passes through custom values', () => {
    const result = listOptionsSchema.parse({
      page: 3,
      limit: 10,
      sort: 'name',
      order: 'asc',
      includeDeleted: true,
    });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
    expect(result.sort).toBe('name');
    expect(result.order).toBe('asc');
    expect(result.includeDeleted).toBe(true);
  });

  it('rejects an invalid order value', () => {
    expect(() => listOptionsSchema.parse({ order: 'random' })).toThrow();
  });

  it('rejects page of 0 (must be positive)', () => {
    expect(() => listOptionsSchema.parse({ page: 0 })).toThrow();
  });

  it('rejects limit of 0 (must be positive)', () => {
    expect(() => listOptionsSchema.parse({ limit: 0 })).toThrow();
  });
});
