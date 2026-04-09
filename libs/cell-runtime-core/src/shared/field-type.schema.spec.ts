import { describe, it, expect } from 'vitest';
import { fieldTypeSchema } from './field-type.schema.js';

describe('fieldTypeSchema', () => {
  const validTypes = ['string', 'text', 'number', 'boolean', 'date', 'datetime', 'enum', 'object'];

  for (const t of validTypes) {
    it(`accepts "${t}"`, () => {
      expect(() => fieldTypeSchema.parse(t)).not.toThrow();
      expect(fieldTypeSchema.parse(t)).toBe(t);
    });
  }

  it('rejects an unknown type', () => {
    expect(() => fieldTypeSchema.parse('richtext')).toThrow();
  });
});
