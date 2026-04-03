import { describe, it, expect } from 'vitest';
import { resolveValue, resolveBinding } from './resolveValue';

// ── resolveValue ──────────────────────────────────────────────────────────────

describe('resolveValue', () => {
  it('resolves a top-level key', () => {
    expect(resolveValue({ name: 'Alice' }, 'name')).toBe('Alice');
  });

  it('resolves a nested dotted path', () => {
    expect(resolveValue({ address: { city: 'Paris' } }, 'address.city')).toBe('Paris');
  });

  it('resolves deeply nested path', () => {
    expect(resolveValue({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
  });

  it('returns undefined for missing key', () => {
    expect(resolveValue({ name: 'Alice' }, 'email')).toBeUndefined();
  });

  it('returns undefined for partially missing nested path', () => {
    expect(resolveValue({ address: null }, 'address.city')).toBeUndefined();
  });

  it('returns undefined for non-object mid-path', () => {
    expect(resolveValue({ name: 'Alice' }, 'name.first')).toBeUndefined();
  });
});

// ── resolveBinding ────────────────────────────────────────────────────────────

describe('resolveBinding', () => {
  it('returns undefined for null binding', () => {
    expect(resolveBinding({}, null)).toBeUndefined();
  });

  it('returns undefined for undefined binding', () => {
    expect(resolveBinding({}, undefined)).toBeUndefined();
  });

  it('resolves a field binding', () => {
    const record = { email: 'user@example.com' };
    expect(resolveBinding(record, { field: 'email' })).toBe('user@example.com');
  });

  it('returns literal value binding', () => {
    expect(resolveBinding({}, { value: 'fixed-value' })).toBe('fixed-value');
  });

  it('returns a primitive binding as-is', () => {
    expect(resolveBinding({}, 'raw-string')).toBe('raw-string');
    expect(resolveBinding({}, 42)).toBe(42);
    expect(resolveBinding({}, true)).toBe(true);
  });
});
