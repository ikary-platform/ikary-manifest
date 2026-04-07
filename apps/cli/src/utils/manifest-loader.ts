import { readFile } from 'node:fs/promises';
import { CellManifestV1Schema } from '@ikary-manifest/contract';
import { compileCellApp, isValidationResult } from '@ikary-manifest/engine';

export interface LoadResult {
  valid: boolean;
  manifest?: unknown;
  compiled?: unknown;
  errors: Array<{ path: string; message: string }>;
}

export async function loadManifestJson(filePath: string): Promise<LoadResult> {
  const raw = await readFile(filePath, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { valid: false, errors: [{ path: 'root', message: `Invalid JSON: ${String(e)}` }] };
  }

  const result = CellManifestV1Schema.safeParse(parsed);
  if (!result.success) {
    return {
      valid: false,
      manifest: parsed,
      errors: result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    };
  }

  return { valid: true, manifest: result.data, errors: [] };
}

export async function compileManifestJson(filePath: string): Promise<LoadResult> {
  const loadResult = await loadManifestJson(filePath);
  if (!loadResult.valid || !loadResult.manifest) return loadResult;

  const compiled = compileCellApp(loadResult.manifest as any);
  if (isValidationResult(compiled)) {
    return {
      valid: false,
      manifest: loadResult.manifest,
      errors: compiled.errors.map((e: any) => ({
        path: e.field || '',
        message: e.message,
      })),
    };
  }

  return { valid: true, manifest: loadResult.manifest, compiled, errors: [] };
}
