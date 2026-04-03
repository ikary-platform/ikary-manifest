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

  it('loads CRM manifest from YAML file', async () => {
    const result = await loadManifestFromFile(join(MANIFESTS_DIR, 'crm-manifest.yaml'));

    expect(result.valid).toBe(true);
    expect(result.manifest!.metadata.key).toBe('crm');
    expect(result.manifest!.spec.entities).toHaveLength(2);
  });

  it('rejects unsupported file extension', async () => {
    const result = await loadManifestFromFile('manifest.toml');

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('Unsupported file extension');
  });
});
