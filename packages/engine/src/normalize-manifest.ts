import type { CellManifestV1 } from '@ikary-manifest/contract';

export function normalizeManifest(manifest: CellManifestV1): CellManifestV1 {
  return {
    ...manifest,
    spec: {
      ...manifest.spec,
      entities: manifest.spec.entities ?? [],
      pages: manifest.spec.pages ?? [],
      navigation: manifest.spec.navigation ?? { items: [] },
    },
  };
}
