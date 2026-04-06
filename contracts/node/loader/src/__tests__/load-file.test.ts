import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { loadManifestFromFile } from '../load-file';

const MANIFESTS_DIR = join(__dirname, '..', '..', '..', '..', '..', 'manifests', 'examples');

describe('loadManifestFromFile', () => {
  it('loads YAML file by .yaml extension', async () => {
    const result = await loadManifestFromFile(join(MANIFESTS_DIR, 'minimal-manifest.yaml'));

    expect(result.valid).toBe(true);
    expect(result.manifest).toBeDefined();
    expect(result.manifest!.metadata.key).toBe('minimal');
  });

  it('loads CRM manifest (with $ref entities stripped, structuralOnly)', async () => {
    const result = await loadManifestFromFile(
      join(MANIFESTS_DIR, 'crm-manifest.yaml'),
      { structuralOnly: true },
    );

    expect(result.valid).toBe(true);
    expect(result.manifest!.metadata.key).toBe('crm');
  });

  it('loads JSON file by .json extension', async () => {
    const fs = await import('node:fs/promises');
    const os = await import('node:os');
    const path = await import('node:path');

    const manifest = {
      apiVersion: 'ikary.co/v1alpha1',
      kind: 'Cell',
      metadata: { key: 'json-test', name: 'JSON Test', version: '1.0.0' },
      spec: {
        mount: { mountPath: '/', landingPage: 'dashboard' },
        pages: [{ key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' }],
      },
    };
    const tmpFile = path.join(os.tmpdir(), 'test-manifest.json');
    await fs.writeFile(tmpFile, JSON.stringify(manifest));

    const result = await loadManifestFromFile(tmpFile);
    expect(result.valid).toBe(true);
    expect(result.manifest!.metadata.key).toBe('json-test');

    await fs.unlink(tmpFile);
  });

  it('rejects unsupported file extension', async () => {
    const result = await loadManifestFromFile('manifest.toml');

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('Unsupported file extension');
  });
});
