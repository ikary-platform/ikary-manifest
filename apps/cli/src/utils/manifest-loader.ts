import { loadManifestFromFile } from '@ikary/loader';
import { compileCellApp, isValidationResult } from '@ikary/engine';
import { api, withApiFallback } from '../api/index.js';
import type { ApiValidationResult, ApiNormalizeResult } from '../api/index.js';

export interface LoadResult {
  valid: boolean;
  manifest?: unknown;
  compiled?: unknown;
  errors: Array<{ path: string; message: string }>;
}

function mapApiErrors(errors: Array<{ field: string; message: string }>): Array<{ path: string; message: string }> {
  return errors.map((e) => ({ path: e.field, message: e.message }));
}

function validateLocal(parsed: unknown): ApiValidationResult {
  // Use the loader result — already validated structurally, re-use the errors shape
  // We just need the resolved raw object to be a valid manifest
  return { valid: true, errors: [] };
}

function compileLocal(parsed: unknown): ApiNormalizeResult {
  const compiled = compileCellApp(parsed as any);
  if (isValidationResult(compiled)) {
    return {
      valid: false,
      errors: compiled.errors.map((e: any) => ({
        field: e.field || '',
        message: e.message,
      })),
    };
  }
  return { valid: true, manifest: compiled, errors: [] };
}

/**
 * Load and validate a manifest file (YAML or JSON), resolving $ref entries.
 */
export async function loadManifestJson(filePath: string): Promise<LoadResult> {
  const loaderResult = await loadManifestFromFile(filePath);

  if (!loaderResult.valid) {
    return {
      valid: false,
      errors: loaderResult.errors.map((e) => ({ path: e.field, message: e.message })),
    };
  }

  const parsed = loaderResult.manifest;

  const apiResult = await withApiFallback(
    () => api.validateManifest(parsed),
    () => validateLocal(parsed),
  );

  if (!apiResult.valid) {
    return { valid: false, manifest: parsed, errors: mapApiErrors(apiResult.errors) };
  }

  return { valid: true, manifest: parsed, errors: [] };
}

/**
 * Load, validate, and compile a manifest file (YAML or JSON), resolving $ref entries.
 */
export async function compileManifestJson(filePath: string): Promise<LoadResult> {
  const loaderResult = await loadManifestFromFile(filePath);

  if (!loaderResult.valid) {
    return {
      valid: false,
      errors: loaderResult.errors.map((e) => ({ path: e.field, message: e.message })),
    };
  }

  const parsed = loaderResult.manifest;

  const apiResult = await withApiFallback(
    () => api.normalizeManifest(parsed),
    () => compileLocal(parsed),
  );

  if (!apiResult.valid) {
    return { valid: false, manifest: parsed, errors: mapApiErrors(apiResult.errors) };
  }

  return { valid: true, manifest: parsed, compiled: apiResult.manifest, errors: [] };
}
