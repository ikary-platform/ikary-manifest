import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const PROMPT_FILE_SUFFIX = '.prompt.md';

export async function loadPromptFiles(rootDir: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  await walk(rootDir, files);
  return files;
}

async function walk(dir: string, acc: Record<string, string>): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, acc);
    } else if (entry.isFile() && entry.name.endsWith(PROMPT_FILE_SUFFIX)) {
      acc[full] = await readFile(full, 'utf8');
    }
  }
}
