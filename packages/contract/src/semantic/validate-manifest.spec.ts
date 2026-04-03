import { describe, expect, it } from 'vitest';
import type { CellManifestV1 } from '../shared/types';
import { parseManifest } from './structural/parse-manifest';
import { validateManifest } from './validate-manifest';
import { validateBusinessRules, validateManifestSemantics } from './validate-manifest-semantics';

function makeManifest(): CellManifestV1 {
  return {
    apiVersion: 'ikary.io/v1alpha1',
    kind: 'Cell',
    metadata: {
      key: 'test-cell',
      name: 'Test Cell',
      version: '1.0.0',
    },
    spec: {
      mount: {
        mountPath: '/',
        landingPage: 'dashboard',
      },
      pages: [
        {
          key: 'dashboard',
          type: 'dashboard',
          title: 'Dashboard',
          path: '/dashboard',
        },
      ],
      entities: [],
    },
  };
}

describe('structural parse', () => {
  it('parses a valid manifest', () => {
    const result = parseManifest(makeManifest());

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.manifest?.metadata.key).toBe('test-cell');
  });

  it('returns structural errors for invalid input', () => {
    const result = parseManifest({});

    expect(result.valid).toBe(false);
    expect(result.manifest).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('validateManifest', () => {
  it('returns structural errors when parse fails', () => {
    const result = validateManifest({ kind: 'Cell' });

    expect(result.valid).toBe(false);
    expect(result.manifest).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns semantic errors when parse passes but business rules fail', () => {
    const manifest = makeManifest();
    manifest.spec.mount.landingPage = 'missing-page';

    const result = validateManifest(manifest);

    expect(result.valid).toBe(false);
    expect(result.manifest).toBeDefined();
    expect(result.errors.some((error) => error.field === 'spec.mount.landingPage')).toBe(true);
  });

  it('returns valid result for a fully valid manifest', () => {
    const result = validateManifest(makeManifest());

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.manifest?.metadata.key).toBe('test-cell');
  });
});

describe('semantic validators', () => {
  it('uses empty navigation when navigation is omitted', () => {
    const manifest = makeManifest();
    const errors = validateManifestSemantics(manifest);

    expect(errors).toEqual([]);
  });

  it('handles missing optional pages array in semantic validation', () => {
    const manifest: CellManifestV1 = {
      apiVersion: 'ikary.io/v1alpha1',
      kind: 'Cell',
      metadata: {
        key: 'semantic-without-pages',
        name: 'Semantic Without Pages',
        version: '1.0.0',
      },
      spec: {
        mount: {
          mountPath: '/',
          landingPage: 'dashboard',
        },
      },
    };

    const errors = validateManifestSemantics(manifest);
    expect(errors.some((error) => error.field === 'spec.mount.landingPage')).toBe(true);
  });

  it('validateBusinessRules is an alias for validateManifestSemantics', () => {
    const manifest = makeManifest();
    manifest.spec.mount.landingPage = 'unknown';

    expect(validateBusinessRules(manifest)).toEqual(validateManifestSemantics(manifest));
  });
});
