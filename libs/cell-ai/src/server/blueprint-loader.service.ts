import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename, extname, dirname } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { parseManifest } from '@ikary/cell-contract';
import type { BlueprintMetadata } from '../shared/blueprint.schema';

export interface BlueprintLoaderOptions {
  /** Absolute path to the `manifests/examples/` directory. */
  examplesDir: string;
}

@Injectable()
export class BlueprintLoaderService {
  private readonly logger = new Logger(BlueprintLoaderService.name);
  private cache: BlueprintMetadata[] | null = null;

  constructor(private readonly options: BlueprintLoaderOptions) {}

  async list(): Promise<BlueprintMetadata[]> {
    if (this.cache) return this.cache;
    const results: BlueprintMetadata[] = [];
    const categories = await readdir(this.options.examplesDir, { withFileTypes: true });
    for (const entry of categories) {
      if (!entry.isDirectory()) continue;
      const categoryDir = join(this.options.examplesDir, entry.name);
      const files = await readdir(categoryDir);
      for (const file of files) {
        if (extname(file) !== '.yaml') continue;
        const id = `${entry.name}/${basename(file, '.yaml')}`;
        const source = join(categoryDir, file);
        try {
          const meta = await this.readMetadata(source, id, entry.name);
          if (meta) results.push(meta);
        } catch (err) {
          this.logger.warn(`Failed to read blueprint ${id}: ${(err as Error).message}`);
        }
      }
    }
    this.cache = results;
    return results;
  }

  async load(id: string): Promise<unknown> {
    const all = await this.list();
    const entry = all.find((b) => b.id === id);
    if (!entry) throw new NotFoundException(`Blueprint not found: ${id}`);
    const raw = await readFile(entry.source, 'utf8');
    const parsed = stripSchemaMeta(parseYaml(raw));
    const result = parseManifest(parsed);
    if (!result.valid || !result.manifest) {
      throw new Error(`Blueprint ${id} failed manifest validation.`);
    }
    return result.manifest;
  }

  private async readMetadata(
    source: string,
    id: string,
    category: string,
  ): Promise<BlueprintMetadata | null> {
    const raw = await readFile(source, 'utf8');
    const doc = stripSchemaMeta(parseYaml(raw)) as
      | { metadata?: { name?: string; description?: string } }
      | null;
    if (!doc?.metadata?.name) return null;
    const categoryDisplay = category[0]!.toUpperCase() + category.slice(1);
    return {
      id,
      category,
      title: doc.metadata.name,
      description: doc.metadata.description,
      source,
    };
  }
}

function stripSchemaMeta(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const clone: Record<string, unknown> = { ...(value as Record<string, unknown>) };
  delete clone.$schema;
  delete clone.$ref;
  return clone;
}

export function defaultExamplesDir(repoRoot: string): string {
  return join(repoRoot, 'manifests', 'examples');
}

// Silence unused-import warning for `dirname` if tree-shaken; kept for future callers.
void dirname;
