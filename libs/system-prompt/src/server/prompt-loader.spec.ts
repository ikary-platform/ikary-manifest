import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadPromptFiles } from './prompt-loader';

describe('loadPromptFiles', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'prompt-loader-'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('discovers .prompt.md files recursively', async () => {
    mkdirSync(join(root, 'a'), { recursive: true });
    mkdirSync(join(root, 'a', 'nested'), { recursive: true });
    writeFileSync(join(root, 'top.prompt.md'), 'TOP');
    writeFileSync(join(root, 'a', 'mid.prompt.md'), 'MID');
    writeFileSync(join(root, 'a', 'nested', 'deep.prompt.md'), 'DEEP');

    const files = await loadPromptFiles(root);
    expect(Object.keys(files)).toHaveLength(3);
    expect(Object.values(files).sort()).toEqual(['DEEP', 'MID', 'TOP']);
  });

  it('ignores files that do not end in .prompt.md', async () => {
    writeFileSync(join(root, 'keep.prompt.md'), 'keep');
    writeFileSync(join(root, 'skip.md'), 'skip');
    writeFileSync(join(root, 'skip.txt'), 'skip');

    const files = await loadPromptFiles(root);
    expect(Object.values(files)).toEqual(['keep']);
  });

  it('returns an empty record when the directory has no prompts', async () => {
    const files = await loadPromptFiles(root);
    expect(files).toEqual({});
  });
});
