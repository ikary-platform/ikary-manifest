import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadManifestFromYaml } from '../load-yaml';
import { loadManifestFromJson } from '../load-json';

const MANIFESTS_DIR = join(__dirname, '..', '..', '..', '..', '..', 'manifests', 'examples');

describe('loadManifestFromYaml', () => {
  it('parses minimal manifest YAML successfully', () => {
    const yaml = readFileSync(join(MANIFESTS_DIR, 'minimal-manifest.yaml'), 'utf-8');
    const result = loadManifestFromYaml(yaml);

    expect(result.valid).toBe(true);
    expect(result.manifest).toBeDefined();
    expect(result.manifest!.apiVersion).toBe('ikary.co/v1alpha1');
    expect(result.manifest!.kind).toBe('Cell');
    expect(result.manifest!.metadata.key).toBe('minimal');
  });

  it('parses CRM manifest YAML successfully', () => {
    const yaml = readFileSync(join(MANIFESTS_DIR, 'crm-manifest.yaml'), 'utf-8');
    const result = loadManifestFromYaml(yaml);

    expect(result.valid).toBe(true);
    expect(result.manifest).toBeDefined();
    expect(result.manifest!.metadata.key).toBe('crm');
    expect(result.manifest!.spec.entities).toHaveLength(2);
    expect(result.manifest!.spec.entities![0].key).toBe('customer');
  });

  it('returns YAML parse errors for invalid syntax', () => {
    const result = loadManifestFromYaml('{{{{ not: valid: yaml');
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('YAML parse error');
  });

  it('returns structural errors for valid YAML but invalid manifest shape', () => {
    const result = loadManifestFromYaml('foo: bar');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('supports structuralOnly option (skips semantic validation)', () => {
    const yaml = readFileSync(join(MANIFESTS_DIR, 'minimal-manifest.yaml'), 'utf-8');
    const result = loadManifestFromYaml(yaml, { structuralOnly: true });

    expect(result.valid).toBe(true);
    expect(result.manifest).toBeDefined();
  });

  it('includes raw parsed object in result', () => {
    const yaml = readFileSync(join(MANIFESTS_DIR, 'minimal-manifest.yaml'), 'utf-8');
    const result = loadManifestFromYaml(yaml);

    expect(result.raw).toBeDefined();
    expect((result.raw as Record<string, unknown>).apiVersion).toBe('ikary.co/v1alpha1');
  });

  it('YAML version string is preserved as string, not parsed as number', () => {
    const yaml = readFileSync(join(MANIFESTS_DIR, 'minimal-manifest.yaml'), 'utf-8');
    const result = loadManifestFromYaml(yaml);

    expect(result.manifest!.metadata.version).toBe('1.0.0');
    expect(typeof result.manifest!.metadata.version).toBe('string');
  });
});

describe('YAML-JSON round-trip', () => {
  it('minimal manifest: YAML and JSON produce identical validated manifests', () => {
    const yaml = readFileSync(join(MANIFESTS_DIR, 'minimal-manifest.yaml'), 'utf-8');
    const json = JSON.stringify({
      apiVersion: 'ikary.co/v1alpha1',
      kind: 'Cell',
      metadata: { key: 'minimal', name: 'Minimal Cell', version: '1.0.0' },
      spec: {
        mount: { mountPath: '/', landingPage: 'dashboard' },
        pages: [{ key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' }],
      },
    });

    const yamlResult = loadManifestFromYaml(yaml);
    const jsonResult = loadManifestFromJson(json);

    expect(yamlResult.valid).toBe(true);
    expect(jsonResult.valid).toBe(true);
    expect(yamlResult.manifest).toEqual(jsonResult.manifest);
  });
});
