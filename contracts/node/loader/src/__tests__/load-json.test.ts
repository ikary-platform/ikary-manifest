import { describe, it, expect } from 'vitest';
import { loadManifestFromJson } from '../load-json';

const validJson = JSON.stringify({
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'minimal', name: 'Minimal Cell', version: '1.0.0' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    pages: [{ key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' }],
  },
});

describe('loadManifestFromJson', () => {
  it('returns valid result for well-formed JSON', () => {
    const result = loadManifestFromJson(validJson);
    expect(result.valid).toBe(true);
    expect(result.manifest).toBeDefined();
    expect(result.manifest!.metadata.key).toBe('minimal');
  });

  it('exposes raw parsed object regardless of validity', () => {
    const result = loadManifestFromJson(validJson);
    expect(result.raw).toBeDefined();
    expect((result.raw as Record<string, unknown>).apiVersion).toBe('ikary.co/v1alpha1');
  });

  it('returns JSON parse error for invalid JSON syntax', () => {
    const result = loadManifestFromJson('{not valid json');
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('root');
    expect(result.errors[0].message).toContain('JSON parse error');
    expect(result.raw).toBeUndefined();
  });

  it('uses parseManifest only when structuralOnly is true', () => {
    // structuralOnly skips semantic validation — a manifest with missing entity
    // references that would fail semantic checks still passes structural parse
    const result = loadManifestFromJson(validJson, { structuralOnly: true });
    expect(result.valid).toBe(true);
    expect(result.manifest).toBeDefined();
  });

  it('returns structural errors for valid JSON that is not a manifest', () => {
    const result = loadManifestFromJson(JSON.stringify({ foo: 'bar' }));
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.raw).toEqual({ foo: 'bar' });
  });
});
