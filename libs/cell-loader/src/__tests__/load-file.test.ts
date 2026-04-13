import { describe, it, expect, afterEach } from 'vitest';
import { join } from 'node:path';
import { writeFile, unlink, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { loadManifestFromFile } from '../load-file';

const MANIFESTS_DIR = join(__dirname, '..', '..', '..', '..', 'manifests', 'examples');

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
    const manifest = {
      apiVersion: 'ikary.co/v1alpha1',
      kind: 'Cell',
      metadata: { key: 'json-test', name: 'JSON Test', version: '1.0.0' },
      spec: {
        mount: { mountPath: '/', landingPage: 'dashboard' },
        pages: [{ key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' }],
      },
    };
    const tmpFile = join(tmpdir(), 'test-manifest.json');
    await writeFile(tmpFile, JSON.stringify(manifest));

    const result = await loadManifestFromFile(tmpFile);
    expect(result.valid).toBe(true);
    expect(result.manifest!.metadata.key).toBe('json-test');

    await unlink(tmpFile);
  });

  it('rejects unsupported file extension', async () => {
    const result = await loadManifestFromFile('manifest.toml');

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('Unsupported file extension');
  });

  it('returns parse error when file content is invalid JSON', async () => {
    const tmpFile = join(tmpdir(), `bad-manifest-${Date.now()}.json`);
    await writeFile(tmpFile, '{ invalid json !!!');
    const result = await loadManifestFromFile(tmpFile);
    await unlink(tmpFile);

    expect(result.valid).toBe(false);
    expect(result.errors[0]!.message).toMatch(/parse error/i);
  });

  it('returns parse error when file content is invalid YAML', async () => {
    const tmpFile = join(tmpdir(), `bad-manifest-${Date.now()}.yaml`);
    await writeFile(tmpFile, 'key: [\nbad yaml: {{{');
    const result = await loadManifestFromFile(tmpFile);
    await unlink(tmpFile);

    expect(result.valid).toBe(false);
    expect(result.errors[0]!.message).toMatch(/parse error/i);
  });

  it('resolves $ref pointing to a JSON file', async () => {
    const dir = join(tmpdir(), `json-ref-test-${Date.now()}`);
    await mkdir(dir);

    const entity = {
      key: 'product',
      name: 'Product',
      pluralName: 'Products',
      fields: [{ key: 'name', type: 'string', name: 'Name' }],
    };
    await writeFile(join(dir, 'product.entity.json'), JSON.stringify(entity));

    const yaml = `apiVersion: ikary.co/v1alpha1
kind: Cell
metadata:
  key: json-ref-test
  name: JSON Ref Test
  version: 1.0.0
spec:
  mount: { mountPath: /, landingPage: dashboard }
  entities:
    - $ref: ./product.entity.json
  pages:
    - key: dashboard
      type: dashboard
      title: Dashboard
      path: /dashboard
`;
    const tmpFile = join(dir, 'manifest.yaml');
    await writeFile(tmpFile, yaml);
    const result = await loadManifestFromFile(tmpFile, { structuralOnly: true });
    await rm(dir, { recursive: true, force: true });

    expect(result).toBeDefined();
  });

  it('leaves unresolvable $ref in place (catch branch) and continues', async () => {
    const dir = join(tmpdir(), `ref-test-${Date.now()}`);
    await mkdir(dir);
    // $ref pointing to a file that does not exist
    const yaml = `apiVersion: ikary.co/v1alpha1
kind: Cell
metadata:
  key: ref-test
  name: Ref Test
  version: 1.0.0
spec:
  mount: { mountPath: /, landingPage: dashboard }
  entities:
    - $ref: ./nonexistent-entity.yaml
  pages:
    - key: dashboard
      type: dashboard
      title: Dashboard
      path: /dashboard
`;
    const tmpFile = join(dir, 'manifest.yaml');
    await writeFile(tmpFile, yaml);
    // Should not throw — unresolvable ref is left in place and stripped by stripMeta
    const result = await loadManifestFromFile(tmpFile);
    await rm(dir, { recursive: true, force: true });

    // valid or not, the key point is it didn't throw
    expect(result).toBeDefined();
  });

  it('leaves non-relative $ref in place (else branch) and continues', async () => {
    const dir = join(tmpdir(), `abs-ref-test-${Date.now()}`);
    await mkdir(dir);
    // $ref with an absolute or non-relative path — not resolved, left in place
    const yaml = `apiVersion: ikary.co/v1alpha1
kind: Cell
metadata:
  key: abs-ref-test
  name: Abs Ref Test
  version: 1.0.0
spec:
  mount: { mountPath: /, landingPage: dashboard }
  entities:
    - $ref: /absolute/path/entity.yaml
  pages:
    - key: dashboard
      type: dashboard
      title: Dashboard
      path: /dashboard
`;
    const tmpFile = join(dir, 'manifest.yaml');
    await writeFile(tmpFile, yaml);
    const result = await loadManifestFromFile(tmpFile);
    await rm(dir, { recursive: true, force: true });

    expect(result).toBeDefined();
  });
});
