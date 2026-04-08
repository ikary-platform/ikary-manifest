import { readFile } from 'node:fs/promises';
import { CellManifestV1Schema } from '@ikary/contract';
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
  const result = CellManifestV1Schema.safeParse(parsed);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    };
  }
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

export async function loadManifestJson(filePath: string): Promise<LoadResult> {
  const raw = await readFile(filePath, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { valid: false, errors: [{ path: 'root', message: `Invalid JSON: ${String(e)}` }] };
  }

  const result = await withApiFallback(
    () => api.validateManifest(parsed),
    () => validateLocal(parsed),
  );

  if (!result.valid) {
    return { valid: false, manifest: parsed, errors: mapApiErrors(result.errors) };
  }

  return { valid: true, manifest: parsed, errors: [] };
}

export async function compileManifestJson(filePath: string): Promise<LoadResult> {
  const raw = await readFile(filePath, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { valid: false, errors: [{ path: 'root', message: `Invalid JSON: ${String(e)}` }] };
  }

  const result = await withApiFallback(
    () => api.normalizeManifest(parsed),
    () => compileLocal(parsed),
  );

  if (!result.valid) {
    return { valid: false, manifest: parsed, errors: mapApiErrors(result.errors) };
  }

  return { valid: true, manifest: parsed, compiled: result.manifest, errors: [] };
}
