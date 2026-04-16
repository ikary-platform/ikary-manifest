import { describe, expect, it } from 'vitest';
import { normalizeManifestForComparison } from '../core/normalization';

describe('normalizeManifestForComparison', () => {
  it('normalizes object and keyed array ordering', () => {
    const left = {
      spec: {
        entities: [
          { key: 'b', fields: [{ key: 'two' }, { key: 'one' }] },
          { key: 'a', fields: [{ key: 'alpha' }] },
        ],
      },
      metadata: { name: 'Left', key: 'sample' },
    };
    const right = {
      metadata: { key: 'sample', name: 'Left' },
      spec: {
        entities: [
          { key: 'a', fields: [{ key: 'alpha' }] },
          { key: 'b', fields: [{ key: 'one' }, { key: 'two' }] },
        ],
      },
    };

    expect(normalizeManifestForComparison(left)).toEqual(normalizeManifestForComparison(right));
  });
});
