import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveAppRoot, loadLocalizationConfig, resolveBuildConfig } from './config.loader';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'loc-test-'));
}

function removeDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('resolveAppRoot', () => {
  it('returns cwd when no appPath is provided', () => {
    const cwd = process.cwd();
    expect(resolveAppRoot(cwd)).toBe(path.resolve(cwd));
  });

  it('resolves relative paths against cwd', () => {
    const cwd = '/tmp/workspace';
    expect(resolveAppRoot(cwd, 'apps/web')).toBe(path.resolve(cwd, 'apps/web'));
  });

  it('resolves absolute paths as-is', () => {
    const abs = path.resolve('/opt/app-root');
    expect(resolveAppRoot('/unused/cwd', abs)).toBe(abs);
  });
});

describe('loadLocalizationConfig', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = makeTempDir();
  });

  afterEach(() => {
    removeDir(tempDir);
  });

  it('throws when no config candidate is present', () => {
    expect(() => loadLocalizationConfig(tempDir)).toThrow(/No ikary\.localization\.config\.ts found/);
  });

  it('loads a .ts config file using a named `localizationConfig` export', () => {
    fs.writeFileSync(
      path.join(tempDir, 'ikary.localization.config.ts'),
      `export const localizationConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr'],
  outputDir: 'locales',
  validation: { failOnMissing: false, failOnDuplicate: true },
};
export default localizationConfig;
`,
      'utf8',
    );

    const loaded = loadLocalizationConfig(tempDir);

    expect(loaded.appRoot).toBe(tempDir);
    expect(loaded.configPath).toBe(path.join(tempDir, 'ikary.localization.config.ts'));
    expect(loaded.config.defaultLocale).toBe('en');
    expect(loaded.config.supportedLocales).toEqual(['en', 'fr']);
    expect(loaded.config.outputDir).toBe('locales');
    expect(loaded.config.validation.failOnMissing).toBe(false);
    expect(loaded.config.validation.failOnDuplicate).toBe(true);
  });

  it('loads a config exposing only a named localizationConfig export (no default)', () => {
    fs.writeFileSync(
      path.join(tempDir, 'ikary.localization.config.ts'),
      `export const localizationConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en'],
  outputDir: 'locales',
  validation: { failOnMissing: false, failOnDuplicate: true },
};
`,
      'utf8',
    );

    const loaded = loadLocalizationConfig(tempDir);
    expect(loaded.config.defaultLocale).toBe('en');
  });

  it('loads a config using `export default` with no named localizationConfig', () => {
    fs.writeFileSync(
      path.join(tempDir, 'ikary.localization.config.ts'),
      `export default {
  defaultLocale: 'en',
  supportedLocales: ['en'],
  outputDir: 'locales',
  validation: { failOnMissing: false, failOnDuplicate: true },
};
`,
      'utf8',
    );

    const loaded = loadLocalizationConfig(tempDir);
    expect(loaded.config.defaultLocale).toBe('en');
  });

  it('loads a config written as a .js module.exports file', () => {
    fs.writeFileSync(
      path.join(tempDir, 'ikary.localization.config.js'),
      `module.exports = {
  defaultLocale: 'en',
  supportedLocales: ['en'],
  outputDir: 'locales',
  validation: { failOnMissing: false, failOnDuplicate: true },
};
`,
      'utf8',
    );

    const loaded = loadLocalizationConfig(tempDir);
    expect(loaded.config.defaultLocale).toBe('en');
    expect(loaded.configPath.endsWith('.js')).toBe(true);
  });

  it('throws when loaded config is invalid', () => {
    fs.writeFileSync(
      path.join(tempDir, 'ikary.localization.config.ts'),
      `export const localizationConfig = {
  defaultLocale: 'en',
  supportedLocales: ['fr'],
  outputDir: 'locales',
};
`,
      'utf8',
    );

    expect(() => loadLocalizationConfig(tempDir)).toThrow();
  });
});

describe('resolveBuildConfig', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = makeTempDir();
  });

  afterEach(() => {
    removeDir(tempDir);
  });

  it('appends resolved outputRoot and validation', () => {
    fs.writeFileSync(
      path.join(tempDir, 'ikary.localization.config.ts'),
      `export const localizationConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr'],
  outputDir: 'dist-locales',
  validation: { failOnMissing: true, failOnDuplicate: false },
};
`,
      'utf8',
    );

    const built = resolveBuildConfig(tempDir);

    expect(built.outputRoot).toBe(path.resolve(tempDir, 'dist-locales'));
    expect(built.validation).toEqual({ failOnMissing: true, failOnDuplicate: false });
    expect(built.appRoot).toBe(tempDir);
    expect(built.config.defaultLocale).toBe('en');
  });
});
