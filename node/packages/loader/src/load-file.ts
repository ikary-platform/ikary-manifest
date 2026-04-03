import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { loadManifestFromYaml } from './load-yaml';
import { loadManifestFromJson } from './load-json';
import type { LoadManifestResult, LoadManifestOptions } from './types';

/**
 * Load a manifest from a file path. Detects format by extension.
 * Supports: .yaml, .yml, .json
 */
export async function loadManifestFromFile(
  filePath: string,
  options?: LoadManifestOptions,
): Promise<LoadManifestResult> {
  const ext = extname(filePath).toLowerCase();

  if (ext !== '.yaml' && ext !== '.yml' && ext !== '.json') {
    return {
      valid: false,
      errors: [{ field: 'root', message: `Unsupported file extension: ${ext}` }],
    };
  }

  const content = await readFile(filePath, 'utf-8');

  switch (ext) {
    case '.yaml':
    case '.yml':
      return loadManifestFromYaml(content, options);
    case '.json':
      return loadManifestFromJson(content, options);
    default:
      return {
        valid: false,
        errors: [{ field: 'root', message: `Unsupported file extension: ${ext}` }],
      };
  }
}
