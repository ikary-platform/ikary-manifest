import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Command } from 'commander';
import { registerLocalizationBuildCommand, registerAppInitCommand } from './cli';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'loc-test-'));
}

function removeDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Mock buildLocalization so the `build` subcommand is exercised without the
// full file-system pipeline (which is covered by build.test.ts).
vi.mock('./build', () => ({
  buildLocalization: vi.fn(async () => ({ config: {}, issues: [], generatedFiles: [] })),
}));

import { buildLocalization } from './build';

describe('registerLocalizationBuildCommand', () => {
  beforeEach(() => {
    vi.mocked(buildLocalization).mockClear();
  });

  it('registers a `build` subcommand that delegates to buildLocalization', async () => {
    const program = new Command();
    program.exitOverride();
    registerLocalizationBuildCommand(program);

    await program.parseAsync(['node', 'test', 'build', '--app', '/fake/root']);

    expect(buildLocalization).toHaveBeenCalledTimes(1);
    const call = vi.mocked(buildLocalization).mock.calls[0][0];
    expect(call?.app).toBe('/fake/root');
    expect(call?.watch).toBe(false);
    expect(call?.failOnMissing).toBeUndefined();
    expect(call?.failOnDuplicate).toBeUndefined();
  });

  it('forwards --watch / --fail-on-missing / --fail-on-duplicate flags', async () => {
    const program = new Command();
    program.exitOverride();
    registerLocalizationBuildCommand(program);

    await program.parseAsync([
      'node',
      'test',
      'build',
      '--app',
      '/fake',
      '--watch',
      '--fail-on-missing',
      '--fail-on-duplicate',
    ]);

    const call = vi.mocked(buildLocalization).mock.calls[0][0];
    expect(call?.watch).toBe(true);
    expect(call?.failOnMissing).toBe(true);
    expect(call?.failOnDuplicate).toBe(true);
  });

  it('defaults --app to "." when not provided', async () => {
    const program = new Command();
    program.exitOverride();
    registerLocalizationBuildCommand(program);

    await program.parseAsync(['node', 'test', 'build']);
    expect(vi.mocked(buildLocalization).mock.calls[0][0]?.app).toBe('.');
  });
});

describe('registerAppInitCommand', () => {
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

  function runInit(args: string[]): Promise<Command> {
    const program = new Command();
    program.exitOverride();
    registerAppInitCommand(program);
    return program.parseAsync(['node', 'test', 'init', ...args]);
  }

  it('creates config, source, override, and output directories with template files', async () => {
    await runInit(['--path', tempDir, '--default-locale', 'en', '--locales', 'en,fr']);

    const configPath = path.join(tempDir, 'ikary.localization.config.ts');
    const enPath = path.join(tempDir, 'src', 'locales', 'en.ts');
    const overrideEnPath = path.join(tempDir, 'src', 'locales', 'overrides', 'en.ts');

    expect(fs.existsSync(configPath)).toBe(true);
    expect(fs.existsSync(enPath)).toBe(true);
    expect(fs.existsSync(overrideEnPath)).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'locales'))).toBe(true);

    const configSource = fs.readFileSync(configPath, 'utf8');
    expect(configSource).toContain("defaultLocale: 'en'");
    expect(configSource).toContain("['en', 'fr']");
    expect(configSource).toContain("outputDir: 'locales'");

    expect(fs.readFileSync(enPath, 'utf8')).toContain("'app.title': 'Cell'");
    expect(fs.readFileSync(overrideEnPath, 'utf8')).toContain('export const messages = {}');

    expect(logSpy).toHaveBeenCalled();
  });

  it('throws when --default-locale is not present in --locales', async () => {
    await expect(
      runInit(['--path', tempDir, '--default-locale', 'en', '--locales', 'fr,de']),
    ).rejects.toThrow(/default locale must be present/);
  });

  it('does not overwrite existing files without --force', async () => {
    const configPath = path.join(tempDir, 'ikary.localization.config.ts');
    fs.writeFileSync(configPath, 'ORIGINAL_CONFIG', 'utf8');

    await runInit(['--path', tempDir, '--default-locale', 'en', '--locales', 'en,fr']);

    expect(fs.readFileSync(configPath, 'utf8')).toBe('ORIGINAL_CONFIG');
  });

  it('overwrites existing files when --force is provided', async () => {
    const configPath = path.join(tempDir, 'ikary.localization.config.ts');
    fs.writeFileSync(configPath, 'ORIGINAL_CONFIG', 'utf8');

    await runInit(['--path', tempDir, '--default-locale', 'en', '--locales', 'en,fr', '--force']);

    const rewritten = fs.readFileSync(configPath, 'utf8');
    expect(rewritten).not.toBe('ORIGINAL_CONFIG');
    expect(rewritten).toContain("defaultLocale: 'en'");
  });

  it('filters out whitespace and empty entries in --locales', async () => {
    await runInit(['--path', tempDir, '--default-locale', 'en', '--locales', ' en , , fr ']);

    const configSource = fs.readFileSync(path.join(tempDir, 'ikary.localization.config.ts'), 'utf8');
    expect(configSource).toContain("['en', 'fr']");
  });

  it('defaults --path to "." when not provided', async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(tempDir);
      // Use the default --path (it defaults to '.', resolving to tempDir).
      const program = new Command();
      program.exitOverride();
      registerAppInitCommand(program);
      await program.parseAsync([
        'node',
        'test',
        'init',
        '--default-locale',
        'en',
        '--locales',
        'en',
      ]);
    } finally {
      process.chdir(originalCwd);
    }

    expect(fs.existsSync(path.join(tempDir, 'ikary.localization.config.ts'))).toBe(true);
  });
});
