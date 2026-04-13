import { readFile } from 'node:fs/promises';
import { extname, dirname, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { parseManifest, validateManifest } from '@ikary/cell-contract';
import { stripMeta } from './strip-meta';
import type { LoadManifestResult, LoadManifestOptions } from './types';

/**
 * Recursively resolve $ref entries in arrays by loading referenced YAML/JSON files.
 * Only resolves relative file paths (e.g. "./entities/customer.entity.yaml").
 */
async function resolveFileRefs(obj: unknown, baseDir: string): Promise<unknown> {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    const resolved: unknown[] = [];
    for (const item of obj) {
      if (
        item !== null &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        '$ref' in (item as Record<string, unknown>) &&
        Object.keys(item as Record<string, unknown>).length === 1
      ) {
        const ref = (item as Record<string, unknown>)['$ref'] as string;
        if (typeof ref === 'string' && (ref.startsWith('./') || ref.startsWith('../'))) {
          const refPath = resolve(baseDir, ref);
          try {
            const refContent = await readFile(refPath, 'utf-8');
            const refExt = extname(refPath).toLowerCase();
            let refParsed: unknown;
            if (refExt === '.yaml' || refExt === '.yml') {
              refParsed = parseYaml(refContent);
            } else {
              refParsed = JSON.parse(refContent);
            }
            resolved.push(await resolveFileRefs(refParsed, dirname(refPath)));
          } catch {
            // Leave unresolvable refs in place; stripMeta will remove them
            resolved.push(item);
          }
        } else {
          resolved.push(item);
        }
      } else {
        resolved.push(await resolveFileRefs(item, baseDir));
      }
    }
    return resolved;
  }

  const record = obj as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = await resolveFileRefs(value, baseDir);
  }
  return result;
}

/**
 * Load a manifest from a file path. Detects format by extension.
 * Supports: .yaml, .yml, .json
 *
 * Relative $ref entries in arrays (e.g. "./entities/customer.entity.yaml")
 * are resolved by loading the referenced file before validation.
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

  let raw: unknown;
  try {
    const content = await readFile(filePath, 'utf-8');
    if (ext === '.yaml' || ext === '.yml') {
      raw = parseYaml(content);
    } else {
      raw = JSON.parse(content);
    }
  } catch (err) {
    return {
      valid: false,
      errors: [
        {
          field: 'root',
          /* v8 ignore next */
          message: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
    };
  }

  const resolved = await resolveFileRefs(raw, dirname(resolve(filePath)));
  const cleaned = stripMeta(resolved);
  const result = options?.structuralOnly ? parseManifest(cleaned) : validateManifest(cleaned);

  return { ...result, raw: resolved };
}
