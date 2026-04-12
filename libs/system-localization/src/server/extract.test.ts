import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractLibraryMessages, extractAppMessages } from './extract';
import type { DiscoveredLocaleSet, DiscoveredLocaleSource } from './discover';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'loc-test-'));
}

function removeDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeLocaleFile(localeDir: string, locale: string, messages: Record<string, string>): string {
  fs.mkdirSync(localeDir, { recursive: true });
  const filePath = path.join(localeDir, `${locale}.ts`);
  const body = `export const messages = ${JSON.stringify(messages, null, 2)} as const;\n`;
  fs.writeFileSync(filePath, body, 'utf8');
  return filePath;
}

function makeDiscovered(
  appRoot: string,
  packageSources: DiscoveredLocaleSource[],
): DiscoveredLocaleSet {
  return {
    appRoot,
    packageJsonPath: path.join(appRoot, 'package.json'),
    packageSources,
    appSourceDir: path.join(appRoot, 'src', 'locales'),
    appOverrideDir: path.join(appRoot, 'src', 'locales', 'overrides'),
  };
}

describe('extractLibraryMessages', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = makeTempDir();
  });

  afterEach(() => {
    removeDir(tempDir);
  });

  it('assigns core layer to core UI packages and library layer to others', () => {
    const coreRoot = path.join(tempDir, 'core-pkg');
    const libRoot = path.join(tempDir, 'lib-pkg');
    const coreLocaleDir = path.join(coreRoot, 'src', 'locales');
    const libLocaleDir = path.join(libRoot, 'src', 'locales');
    writeLocaleFile(coreLocaleDir, 'en', { 'app.title': 'App' });
    writeLocaleFile(libLocaleDir, 'en', { 'widget.label': 'Widget' });

    const discovered = makeDiscovered(tempDir, [
      {
        packageName: '@ikary/system-auth-ui',
        packageRoot: coreRoot,
        localeDir: coreLocaleDir,
      },
      {
        packageName: '@ikary/feature-ui',
        packageRoot: libRoot,
        localeDir: libLocaleDir,
      },
    ]);

    const sources = extractLibraryMessages(discovered, 'en');

    expect(sources).toHaveLength(2);
    const coreSource = sources.find((s) => s.packageName === '@ikary/system-auth-ui');
    const libSource = sources.find((s) => s.packageName === '@ikary/feature-ui');

    expect(coreSource?.layer).toBe('core');
    expect(coreSource?.locale).toBe('en');
    expect(coreSource?.messages).toEqual({ 'app.title': 'App' });

    expect(libSource?.layer).toBe('library');
    expect(libSource?.messages).toEqual({ 'widget.label': 'Widget' });
  });

  it('filters out packages without a locale file for the requested locale', () => {
    const pkgRoot = path.join(tempDir, 'pkg');
    const localeDir = path.join(pkgRoot, 'src', 'locales');
    writeLocaleFile(localeDir, 'en', { 'app.title': 'App' });
    // Only en.ts exists; fr.ts does not.

    const discovered = makeDiscovered(tempDir, [
      { packageName: '@ikary/feature-ui', packageRoot: pkgRoot, localeDir },
    ]);

    const sources = extractLibraryMessages(discovered, 'fr');
    expect(sources).toEqual([]);
  });

  it('returns empty array when no package sources are discovered', () => {
    const discovered = makeDiscovered(tempDir, []);
    expect(extractLibraryMessages(discovered, 'en')).toEqual([]);
  });
});

describe('extractAppMessages', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = makeTempDir();
  });

  afterEach(() => {
    removeDir(tempDir);
  });

  it('returns both app and override sources with correct layers', () => {
    const appSourceDir = path.join(tempDir, 'src', 'locales');
    const appOverrideDir = path.join(appSourceDir, 'overrides');
    writeLocaleFile(appSourceDir, 'en', { 'app.greet': 'Hello' });
    writeLocaleFile(appOverrideDir, 'en', { 'app.greet': 'Howdy' });

    const discovered = makeDiscovered(tempDir, []);
    const sources = extractAppMessages(discovered, 'en');

    expect(sources).toHaveLength(2);
    const appSource = sources.find((s) => s.layer === 'app');
    const overrideSource = sources.find((s) => s.layer === 'override');

    expect(appSource?.packageName).toBe('@app/ui');
    expect(appSource?.messages).toEqual({ 'app.greet': 'Hello' });
    expect(overrideSource?.packageName).toBe('@app/overrides');
    expect(overrideSource?.messages).toEqual({ 'app.greet': 'Howdy' });
  });

  it('returns only the app source when no override file exists', () => {
    const appSourceDir = path.join(tempDir, 'src', 'locales');
    writeLocaleFile(appSourceDir, 'en', { 'app.greet': 'Hello' });

    const discovered = makeDiscovered(tempDir, []);
    const sources = extractAppMessages(discovered, 'en');

    expect(sources).toHaveLength(1);
    expect(sources[0].layer).toBe('app');
  });

  it('returns only the override source when the app file is missing', () => {
    const appSourceDir = path.join(tempDir, 'src', 'locales');
    const appOverrideDir = path.join(appSourceDir, 'overrides');
    writeLocaleFile(appOverrideDir, 'en', { 'app.greet': 'Howdy' });

    const discovered = makeDiscovered(tempDir, []);
    const sources = extractAppMessages(discovered, 'en');

    expect(sources).toHaveLength(1);
    expect(sources[0].layer).toBe('override');
  });

  it('returns empty array when no app or override files exist', () => {
    const discovered = makeDiscovered(tempDir, []);
    expect(extractAppMessages(discovered, 'en')).toEqual([]);
  });

  it('loads messages using the `default` export shape', () => {
    const appSourceDir = path.join(tempDir, 'src', 'locales');
    fs.mkdirSync(appSourceDir, { recursive: true });
    fs.writeFileSync(
      path.join(appSourceDir, 'en.ts'),
      `export default { messages: { 'app.key': 'Hello' } };\n`,
      'utf8',
    );

    const discovered = makeDiscovered(tempDir, []);
    const sources = extractAppMessages(discovered, 'en');

    expect(sources).toHaveLength(1);
    expect(sources[0].messages).toEqual({ 'app.key': 'Hello' });
  });

  it('loads messages from a module.exports plain object (final fallback)', () => {
    const appSourceDir = path.join(tempDir, 'src', 'locales');
    fs.mkdirSync(appSourceDir, { recursive: true });
    fs.writeFileSync(
      path.join(appSourceDir, 'en.ts'),
      `module.exports = { 'app.key': 'MX' };\n`,
      'utf8',
    );

    const discovered = makeDiscovered(tempDir, []);
    const sources = extractAppMessages(discovered, 'en');

    expect(sources).toHaveLength(1);
    expect(sources[0].messages).toEqual({ 'app.key': 'MX' });
  });

  it('loads messages from a plain default-exported object', () => {
    const appSourceDir = path.join(tempDir, 'src', 'locales');
    fs.mkdirSync(appSourceDir, { recursive: true });
    fs.writeFileSync(
      path.join(appSourceDir, 'en.ts'),
      `export default { 'app.key': 'Hi' };\n`,
      'utf8',
    );

    const discovered = makeDiscovered(tempDir, []);
    const sources = extractAppMessages(discovered, 'en');

    expect(sources).toHaveLength(1);
    expect(sources[0].messages).toEqual({ 'app.key': 'Hi' });
  });
});
