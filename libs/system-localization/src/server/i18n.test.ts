import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Command } from 'commander';
import {
  extractI18nCatalog,
  registerI18nExtractCommand,
  registerI18nMissingCommand,
  registerI18nSyncCommand,
} from './i18n';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'loc-test-'));
}

function removeDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeSourceTree(root: string, files: Record<string, string>): void {
  for (const [rel, contents] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, contents, 'utf8');
  }
}

describe('extractI18nCatalog', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = makeTempDir();
  });

  afterEach(() => {
    removeDir(tempDir);
  });

  it('returns empty catalog when src is missing', () => {
    const result = extractI18nCatalog(tempDir);
    expect(result.keys).toEqual([]);
    expect(result.catalog).toEqual({});
  });

  it('extracts keys from t(), <T id="">, and formatMessage({id}) forms', () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "export const v = t('auth.login.title');",
      'src/b.tsx': "export const C = () => <T id=\"workspace.settings.save\">x</T>;",
      'src/c.ts': "formatMessage({ id: 'cart.checkout.label' });",
    });

    const result = extractI18nCatalog(tempDir);

    expect(result.keys).toEqual([
      'auth.login.title',
      'cart.checkout.label',
      'workspace.settings.save',
    ]);
    expect(result.catalog).toEqual({
      'auth.login.title': '',
      'cart.checkout.label': '',
      'workspace.settings.save': '',
    });
  });

  it('skips hidden dirs, node_modules, dist, build, coverage, and non-source files', () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('one.two');",
      'src/.hidden/skip.ts': "t('hidden.skipped');",
      'src/node_modules/skip.ts': "t('modules.skipped');",
      'src/dist/skip.ts': "t('dist.skipped');",
      'src/build/skip.ts': "t('build.skipped');",
      'src/coverage/skip.ts': "t('coverage.skipped');",
      'src/notes.md': "t('markdown.skipped')",
    });

    const result = extractI18nCatalog(tempDir);
    expect(result.keys).toEqual(['one.two']);
  });

  it('deduplicates keys repeated across files', () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('one.two'); t('one.two');",
      'src/b.ts': "t('one.two');",
    });

    const result = extractI18nCatalog(tempDir);
    expect(result.keys).toEqual(['one.two']);
  });

  it('ignores strings that are not valid namespaced keys', () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('no-dots'); t('UPPERCASE.KEY'); t('actual.key');",
    });

    const result = extractI18nCatalog(tempDir);
    expect(result.keys).toEqual(['actual.key']);
  });

  it('recurses into subdirectories', () => {
    writeSourceTree(tempDir, {
      'src/nested/deep/x.tsx': "<T id=\"deep.key\">x</T>",
    });

    const result = extractI18nCatalog(tempDir);
    expect(result.keys).toEqual(['deep.key']);
  });
});

describe('registerI18nExtractCommand', () => {
  let tempDir: string;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tempDir = makeTempDir();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    removeDir(tempDir);
    logSpy.mockRestore();
  });

  it('registers an extract subcommand that writes translations.catalog.json', async () => {
    writeSourceTree(tempDir, { 'src/a.ts': "t('alpha.beta');" });

    const program = new Command();
    program.exitOverride();
    registerI18nExtractCommand(program);

    await program.parseAsync(['node', 'test', 'extract', '--app', tempDir]);

    const outputPath = path.join(tempDir, 'translations.catalog.json');
    expect(fs.existsSync(outputPath)).toBe(true);
    const payload = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(payload.keys).toEqual(['alpha.beta']);
    expect(payload.catalog).toEqual({ 'alpha.beta': '' });
    expect(typeof payload.generatedAt).toBe('string');
    expect(logSpy).toHaveBeenCalled();
  });
});

describe('registerI18nMissingCommand', () => {
  let tempDir: string;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tempDir = makeTempDir();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    removeDir(tempDir);
    logSpy.mockRestore();
  });

  function runMissing(args: string[]): Promise<Command> {
    const program = new Command();
    program.exitOverride();
    registerI18nMissingCommand(program);
    return program.parseAsync(['node', 'test', 'missing', ...args]);
  }

  it('reports missing keys with counts', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('one.key'); t('two.key');",
      'locales/fr.json': JSON.stringify({ 'one.key': 'Un' }),
    });

    await runMissing(['--lang', 'fr', '--app', tempDir]);

    const logged = logSpy.mock.calls.map((call) => String(call[0]));
    expect(logged.join('\n')).toContain('1/2 keys translated');
    expect(logged.join('\n')).toContain('Missing (1)');
    expect(logged.join('\n')).toContain('two.key');
  });

  it('treats empty-string translations as missing', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('one.key');",
      'locales/fr.json': JSON.stringify({ 'one.key': '   ' }),
    });

    await runMissing(['--lang', 'fr', '--app', tempDir]);
    expect(logSpy.mock.calls.some((c) => String(c[0]).includes('Missing (1)'))).toBe(true);
  });

  it('coerces non-string locale values to strings when loading', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('one.key');",
      'locales/fr.json': JSON.stringify({ 'one.key': 42 }),
    });

    await runMissing(['--lang', 'fr', '--app', tempDir]);
    // "42" counts as present (non-empty), so 1/1 translated.
    expect(logSpy.mock.calls.some((c) => String(c[0]).includes('1/1 keys translated'))).toBe(true);
  });

  it('handles null values via the nullish fallback', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('one.key');",
      'locales/fr.json': JSON.stringify({ 'one.key': null }),
    });

    await runMissing(['--lang', 'fr', '--app', tempDir]);
    expect(logSpy.mock.calls.some((c) => String(c[0]).includes('Missing (1)'))).toBe(true);
  });

  it('handles an absent locale file (treats every key as missing)', async () => {
    writeSourceTree(tempDir, { 'src/a.ts': "t('one.key');" });

    await runMissing(['--lang', 'fr', '--app', tempDir]);
    expect(logSpy.mock.calls.some((c) => String(c[0]).includes('Missing (1)'))).toBe(true);
  });

  it('does not throw in strict mode when every key is present', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('one.key');",
      'locales/fr.json': JSON.stringify({ 'one.key': 'Un' }),
    });

    await runMissing(['--lang', 'fr', '--app', tempDir, '--strict']);
  });

  it('throws in strict mode when keys are missing', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('one.key');",
    });

    await expect(runMissing(['--lang', 'fr', '--app', tempDir, '--strict'])).rejects.toThrow(
      /Missing 1 translation keys/,
    );
  });
});

describe('registerI18nSyncCommand', () => {
  let tempDir: string;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tempDir = makeTempDir();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    removeDir(tempDir);
    logSpy.mockRestore();
  });

  function runSync(args: string[]): Promise<Command> {
    const program = new Command();
    program.exitOverride();
    registerI18nSyncCommand(program);
    return program.parseAsync(['node', 'test', 'sync', ...args]);
  }

  it('writes a new catalog when none exists', async () => {
    writeSourceTree(tempDir, { 'src/a.ts': "t('alpha.beta');" });

    await runSync(['--app', tempDir]);

    const catalogPath = path.join(tempDir, 'translations.catalog.json');
    expect(fs.existsSync(catalogPath)).toBe(true);
    const payload = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    expect(payload.keys).toEqual(['alpha.beta']);
  });

  it('is a no-op when catalog already matches extracted keys', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('alpha.beta');",
      'translations.catalog.json': JSON.stringify({ keys: ['alpha.beta'], catalog: { 'alpha.beta': '' } }),
    });

    const catalogPath = path.join(tempDir, 'translations.catalog.json');
    const statBefore = fs.statSync(catalogPath);

    await runSync(['--app', tempDir]);

    expect(logSpy.mock.calls.some((c) => String(c[0]).includes('already in sync'))).toBe(true);
    const statAfter = fs.statSync(catalogPath);
    expect(statAfter.mtimeMs).toBe(statBefore.mtimeMs);
  });

  it('rewrites the catalog when keys drift', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('alpha.beta'); t('gamma.delta');",
      'translations.catalog.json': JSON.stringify({ keys: ['alpha.beta'], catalog: { 'alpha.beta': '' } }),
    });

    await runSync(['--app', tempDir]);

    const payload = JSON.parse(fs.readFileSync(path.join(tempDir, 'translations.catalog.json'), 'utf8'));
    expect(payload.keys).toEqual(['alpha.beta', 'gamma.delta']);
  });

  it('in --check mode, passes when the catalog is in sync', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('alpha.beta');",
      'translations.catalog.json': JSON.stringify({ keys: ['alpha.beta'], catalog: { 'alpha.beta': '' } }),
    });

    await runSync(['--app', tempDir, '--check']);

    expect(logSpy.mock.calls.some((c) => String(c[0]).includes('in sync'))).toBe(true);
  });

  it('in --check mode, throws when the catalog is out of sync', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('alpha.beta'); t('gamma.delta');",
      'translations.catalog.json': JSON.stringify({ keys: ['alpha.beta'], catalog: { 'alpha.beta': '' } }),
    });

    await expect(runSync(['--app', tempDir, '--check'])).rejects.toThrow(/out of sync/);
  });

  it('in --check mode, throws when the catalog does not exist', async () => {
    writeSourceTree(tempDir, { 'src/a.ts': "t('alpha.beta');" });

    await expect(runSync(['--app', tempDir, '--check'])).rejects.toThrow(/out of sync/);
  });

  it('handles a catalog file missing the keys array', async () => {
    writeSourceTree(tempDir, {
      'src/a.ts': "t('alpha.beta');",
      'translations.catalog.json': JSON.stringify({ catalog: {} }),
    });

    await runSync(['--app', tempDir]);

    const payload = JSON.parse(fs.readFileSync(path.join(tempDir, 'translations.catalog.json'), 'utf8'));
    expect(payload.keys).toEqual(['alpha.beta']);
  });
});
