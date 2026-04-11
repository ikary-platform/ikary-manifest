import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateCorrelationId } from '../correlation-id';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateCorrelationId', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a valid v4 UUID using crypto.randomUUID', () => {
    expect(generateCorrelationId()).toMatch(UUID_RE);
  });

  it('generates unique values', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateCorrelationId()));
    expect(ids.size).toBe(50);
  });

  it('falls back to Math.random when crypto.randomUUID is unavailable', () => {
    const original = globalThis.crypto.randomUUID;
    // @ts-expect-error — deliberately removing randomUUID for fallback test
    globalThis.crypto.randomUUID = undefined;
    try {
      const id = generateCorrelationId();
      expect(id).toMatch(UUID_RE);
    } finally {
      globalThis.crypto.randomUUID = original;
    }
  });
});
