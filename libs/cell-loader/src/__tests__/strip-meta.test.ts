import { describe, it, expect } from 'vitest';
import { stripMeta } from '../strip-meta';

describe('stripMeta', () => {
  it('returns null unchanged', () => {
    expect(stripMeta(null)).toBeNull();
  });

  it('returns primitives unchanged', () => {
    expect(stripMeta('hello')).toBe('hello');
    expect(stripMeta(42)).toBe(42);
    expect(stripMeta(true)).toBe(true);
  });

  it('filters out $ref-only objects from arrays', () => {
    const input = [
      { $ref: './entities/customer.entity.yaml' },
      { key: 'invoice', name: 'Invoice' },
    ];
    const result = stripMeta(input) as unknown[];
    expect(result).toHaveLength(1);
    expect((result[0] as Record<string, unknown>).key).toBe('invoice');
  });

  it('keeps objects in arrays that have $ref plus other keys', () => {
    const input = [{ $ref: './customer.yaml', extra: 'data' }];
    const result = stripMeta(input) as unknown[];
    expect(result).toHaveLength(1);
  });

  it('recursively processes array items', () => {
    const input = [{ nested: { $schema: 'something', key: 'val' } }];
    const result = stripMeta(input) as Array<Record<string, unknown>>;
    expect((result[0].nested as Record<string, unknown>)['$schema']).toBeUndefined();
    expect((result[0].nested as Record<string, unknown>).key).toBe('val');
  });

  it('strips $schema key from objects', () => {
    const input = { $schema: './schema.yaml', apiVersion: 'ikary.co/v1alpha1' };
    const result = stripMeta(input) as Record<string, unknown>;
    expect(result['$schema']).toBeUndefined();
    expect(result.apiVersion).toBe('ikary.co/v1alpha1');
  });

  it('leaves objects without $schema unchanged', () => {
    const input = { key: 'test', name: 'Test' };
    const result = stripMeta(input) as Record<string, unknown>;
    expect(result.key).toBe('test');
    expect(result.name).toBe('Test');
  });

  it('recursively strips nested objects', () => {
    const input = {
      spec: {
        $schema: 'inner-schema',
        entities: [{ $ref: './customer.yaml' }, { key: 'invoice' }],
      },
    };
    const result = stripMeta(input) as Record<string, unknown>;
    const spec = result.spec as Record<string, unknown>;
    expect(spec['$schema']).toBeUndefined();
    expect((spec.entities as unknown[]).length).toBe(1);
  });
});
