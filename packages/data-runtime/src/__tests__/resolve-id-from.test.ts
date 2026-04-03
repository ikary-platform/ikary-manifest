import { describe, it, expect } from 'vitest';
import { resolveIdFrom } from '../resolve-id-from';

describe('resolveIdFrom', () => {
  it('returns the string value at a top-level key', () => {
    expect(resolveIdFrom({ id: 'abc' }, 'id')).toBe('abc');
  });

  it('traverses a nested dotted path', () => {
    expect(resolveIdFrom({ company: { id: 'cmp-1' } }, 'company.id')).toBe('cmp-1');
  });

  it('traverses a deeply nested path', () => {
    const record = { a: { b: { c: 'deep' } } };
    expect(resolveIdFrom(record, 'a.b.c')).toBe('deep');
  });

  it('returns undefined when a path segment is missing', () => {
    expect(resolveIdFrom({ id: 'abc' }, 'missing.key')).toBeUndefined();
  });

  it('returns undefined when the terminal value is a number', () => {
    expect(resolveIdFrom({ count: 42 }, 'count')).toBeUndefined();
  });

  it('returns undefined when the terminal value is null', () => {
    expect(resolveIdFrom({ id: null }, 'id')).toBeUndefined();
  });

  it('returns undefined when the terminal value is an object', () => {
    expect(resolveIdFrom({ company: { id: 'x' } }, 'company')).toBeUndefined();
  });

  it('returns undefined for an empty record', () => {
    expect(resolveIdFrom({}, 'id')).toBeUndefined();
  });

  it('returns undefined when an intermediate segment is not an object', () => {
    expect(resolveIdFrom({ a: 'string' }, 'a.b')).toBeUndefined();
  });
});
