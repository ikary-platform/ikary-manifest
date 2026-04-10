import { useState, useMemo, useEffect, useCallback } from 'react';
import { BASE_ENTITY_FIELDS } from '@ikary/cell-contract-core';
import type { ValidationError, CellManifestV1 } from '@ikary/cell-contract-core';
import { compileCellApp, isValidationResult, deriveCreateFields } from '@ikary/cell-engine';
import type { ResolvedCreateField } from '@ikary/cell-engine';
import { BUILDER_SAMPLES } from '../builder-samples';
import { wrapEntityForMode, wrapPage, wrapValidationRules } from '../mode-wrappers';

export type BuilderMode =
  | 'app'
  | 'dashboard'
  | 'list'
  | 'detail'
  | 'form'
  | 'simple-entity'
  | 'nested-entity'
  | 'entity-belongs-to'
  | 'entity-has-many'
  | 'entity-many-to-many'
  | 'entity-polymorphic'
  | 'entity-all-relations'
  | 'computed-expression'
  | 'computed-aggregation'
  | 'computed-conditional'
  | 'computed-all'
  | 'lifecycle-simple'
  | 'lifecycle-guards'
  | 'lifecycle-hooks'
  | 'lifecycle-full'
  | 'events-entity'
  | 'events-lifecycle'
  | 'events-full'
  | 'capabilities-simple'
  | 'capabilities-inputs'
  | 'capabilities-full'
  | 'policies-basic'
  | 'policies-conditional'
  | 'policies-field'
  | 'policies-roles'
  | 'validation';

export interface BuilderState {
  editorText: string;
  setEditorText: (t: string) => void;
  loadSample: () => void;
  reset: () => void;
  parseError: string | null;
  validationErrors: ValidationError[];
  manifest: CellManifestV1 | null;
  translations: Record<string, string>;
  setTranslation: (key: string, value: string) => void;
}

function tryCompileForMode(
  text: string,
  mode: BuilderMode,
): {
  parseError: string | null;
  validationErrors: ValidationError[];
  manifest: CellManifestV1 | null;
} {
  if (!text.trim()) {
    return { parseError: null, validationErrors: [], manifest: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return {
      parseError: e instanceof Error ? e.message : String(e),
      validationErrors: [],
      manifest: null,
    };
  }

  let manifest: unknown = parsed;
  const entityModes = new Set<BuilderMode>([
    'simple-entity',
    'nested-entity',
    'form',
    'list',
    'detail',
    'entity-belongs-to',
    'entity-has-many',
    'entity-many-to-many',
    'entity-polymorphic',
    'entity-all-relations',
    'computed-expression',
    'computed-aggregation',
    'computed-conditional',
    'computed-all',
    'lifecycle-simple',
    'lifecycle-guards',
    'lifecycle-hooks',
    'lifecycle-full',
    'events-entity',
    'events-lifecycle',
    'events-full',
    'capabilities-simple',
    'capabilities-inputs',
    'capabilities-full',
    'policies-basic',
    'policies-conditional',
    'policies-field',
    'policies-roles',
  ]);

  if (entityModes.has(mode)) {
    manifest = wrapEntityForMode(parsed, mode as import('../mode-wrappers').EntityWrapMode);
  } else if (mode === 'validation') {
    manifest = wrapValidationRules(parsed);
  } else if (mode === 'dashboard') {
    manifest = wrapPage(parsed);
  }

  let result: ReturnType<typeof compileCellApp>;
  try {
    result = compileCellApp(manifest as CellManifestV1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      parseError: `Compile error: ${message}`,
      validationErrors: [],
      manifest: null,
    };
  }

  if (isValidationResult(result)) {
    return { parseError: null, validationErrors: result.errors, manifest: null };
  }

  return {
    parseError: null,
    validationErrors: [],
    manifest: result,
  };
}

function collectFieldRuleSeeds(fields: ResolvedCreateField[], seeds: Record<string, string>): void {
  for (const field of fields) {
    for (const rule of field.effectiveFieldRules) {
      if (!(rule.messageKey in seeds)) {
        seeds[rule.messageKey] = rule.defaultMessage ?? rule.messageKey;
      }
    }
    if (field.children) {
      collectFieldRuleSeeds(field.children, seeds);
    }
  }
}

function seedTranslationsFromManifest(manifest: CellManifestV1): Record<string, string> {
  const seeds: Record<string, string> = {};
  for (const entity of manifest.spec.entities ?? []) {
    const createFields = deriveCreateFields([...entity.fields, ...BASE_ENTITY_FIELDS]);
    collectFieldRuleSeeds(createFields, seeds);
  }
  return seeds;
}

export function useBuilderState(mode: BuilderMode): BuilderState {
  const [editorText, setEditorTextRaw] = useState(() => JSON.stringify(BUILDER_SAMPLES[mode], null, 2));
  const [userTranslations, setUserTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    setEditorTextRaw(JSON.stringify(BUILDER_SAMPLES[mode], null, 2));
    setUserTranslations({});
  }, [mode]);

  const compiled = useMemo(() => tryCompileForMode(editorText, mode), [editorText, mode]);

  const translations = useMemo(() => {
    const seeds = compiled.manifest ? seedTranslationsFromManifest(compiled.manifest) : {};
    return { ...seeds, ...userTranslations };
  }, [compiled.manifest, userTranslations]);

  const setTranslation = useCallback((key: string, value: string) => {
    setUserTranslations((prev) => ({ ...prev, [key]: value }));
  }, []);

  const loadSample = () => {
    setEditorTextRaw(JSON.stringify(BUILDER_SAMPLES[mode], null, 2));
  };

  const reset = () => {
    setEditorTextRaw('');
    setUserTranslations({});
  };

  return {
    editorText,
    setEditorText: setEditorTextRaw,
    loadSample,
    reset,
    parseError: compiled.parseError,
    validationErrors: compiled.validationErrors,
    manifest: compiled.manifest,
    translations,
    setTranslation,
  };
}
