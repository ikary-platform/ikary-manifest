import { compileCellApp, isValidationResult } from '@ikary/cell-engine';
import type { StudioCurrentArtifactSet, StudioPreviewModel } from './contracts';
import { assembleManifest } from './artifact-assembler';

export class StudioPreviewService {
  build(currentArtifacts: StudioCurrentArtifactSet): StudioPreviewModel {
    const manifest = assembleManifest(currentArtifacts);

    if (!manifest) {
      return {
        compiledManifest: null,
        compileErrors: ['No manifest available yet. Complete generation to render preview.'],
        entitySummary: [],
        manifestSummary: null,
      };
    }

    const compileResult = compileCellApp(manifest);
    const compileErrors = isValidationResult(compileResult)
      ? compileResult.errors.map((error) => `${error.field}: ${error.message}`)
      : [];

    return {
      compiledManifest: manifest,
      compileErrors,
      entitySummary: (manifest.spec.entities ?? []).map((entity) => ({
        key: entity.key,
        name: entity.name,
        fieldCount: entity.fields.length,
      })),
      manifestSummary: {
        cellKey: manifest.metadata.key,
        cellName: manifest.metadata.name,
        pageCount: (manifest.spec.pages ?? []).length,
        entityCount: (manifest.spec.entities ?? []).length,
      },
    };
  }
}
