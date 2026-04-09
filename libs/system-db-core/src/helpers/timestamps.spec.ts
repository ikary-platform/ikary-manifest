import { describe, it, expect } from 'vitest';
import { toDate } from './timestamps.js';

describe('toDate', () => {
  it('returns null for null input', () => {
    expect(toDate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(toDate(undefined)).toBeNull();
  });

  it('returns the same Date object when given a Date', () => {
    const d = new Date('2024-01-01T00:00:00Z');
    expect(toDate(d)).toBe(d);
  });

  it('parses an ISO string into a Date', () => {
    const result = toDate('2024-06-15T12:00:00Z');
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe('2024-06-15T12:00:00.000Z');
  });
});
