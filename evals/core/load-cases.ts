import { pathToFileURL } from 'node:url';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { evalCaseSchema, type EvalCase } from './case-schema';

export async function loadCases(rootDir: string): Promise<EvalCase[]> {
  const files = (await collectCaseFiles(rootDir)).sort((left, right) => left.localeCompare(right));
  const cases: EvalCase[] = [];

  for (const file of files) {
    const module = await import(pathToFileURL(file).href);
    const exportedCases = Array.isArray(module.default)
      ? module.default
      : module.default
        ? [module.default]
        : [];

    for (const candidate of exportedCases) {
      cases.push(evalCaseSchema.parse(candidate));
    }
  }

  return cases;
}

async function collectCaseFiles(rootDir: string): Promise<string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectCaseFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.case.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}
