import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

type ChokidarHandler = () => void;

interface FakeWatcher {
  handlers: Map<string, ChokidarHandler>;
  on: (event: string, handler: ChokidarHandler) => FakeWatcher;
  close: () => Promise<void>;
  trigger: (event: string) => void;
}

const fakeWatcher: FakeWatcher = {
  handlers: new Map(),
  on(event, handler) {
    this.handlers.set(event, handler);
    return this;
  },
  async close() {
    this.handlers.clear();
  },
  trigger(event) {
    const handler = this.handlers.get(event);
    if (handler) {
      handler();
    }
  },
};

vi.mock('chokidar', () => ({
  default: {
    watch: vi.fn(() => fakeWatcher),
  },
}));

import chokidar from 'chokidar';
import { buildLocalization } from './build';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'loc-test-'));
}

function removeDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

interface FixtureOptions {
  supportedLocales?: string[];
  failOnMissing?: boolean;
  failOnDuplicate?: boolean;
  appMessagesByLocale?: Record<string, Record<string, string>>;
}

/**
 * Creates a minimal app layout at `<temp>/apps/web` with a config and
 * app-level locale files. No library package dependencies are declared,
 * so `discoverLocaleSources` returns an empty `packageSources`.
 */
function makeAppFixture(options: FixtureOptions = {}): { workspaceRoot: string; appRoot: string } {
  const workspaceRoot = makeTempDir();
  const appRoot = path.join(workspaceRoot, 'apps', 'web');
  fs.mkdirSync(appRoot, { recursive: true });
  fs.writeFileSync(
    path.join(appRoot, 'package.json'),
    JSON.stringify({ name: 'app', dependencies: {} }, null, 2),
    'utf8',
  );

  const supportedLocales = options.supportedLocales ?? ['en', 'fr'];
  const failOnMissing = options.failOnMissing ?? false;
  const failOnDuplicate = options.failOnDuplicate ?? true;
  const localesLiteral = supportedLocales.map((l) => `'${l}'`).join(', ');
  fs.writeFileSync(
    path.join(appRoot, 'ikary.localization.config.ts'),
    `export const localizationConfig = {
  defaultLocale: 'en',
  supportedLocales: [${localesLiteral}],
  outputDir: 'locales',
  validation: { failOnMissing: ${failOnMissing}, failOnDuplicate: ${failOnDuplicate} },
};
`,
    'utf8',
  );

  const sourceDir = path.join(appRoot, 'src', 'locales');
  fs.mkdirSync(sourceDir, { recursive: true });
  const messagesByLocale = options.appMessagesByLocale ?? {
    en: { 'app.title': 'Cell' },
    fr: { 'app.title': 'Cellule' },
  };
  for (const [locale, messages] of Object.entries(messagesByLocale)) {
    fs.writeFileSync(
      path.join(sourceDir, `${locale}.ts`),
      `export const messages = ${JSON.stringify(messages, null, 2)} as const;\n`,
      'utf8',
    );
  }

  return { workspaceRoot, appRoot };
}

describe('buildLocalization', () => {
  const cleanup: string[] = [];
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    while (cleanup.length > 0) {
      const dir = cleanup.pop();
      if (dir) {
        removeDir(dir);
      }
    }
  });

  it('builds locale JSON files for every supported locale (sync path)', async () => {
    const { workspaceRoot, appRoot } = makeAppFixture();
    cleanup.push(workspaceRoot);

    const result = await buildLocalization({ cwd: appRoot });

    expect(result.generatedFiles).toHaveLength(2);
    const enPath = path.join(appRoot, 'locales', 'en.json');
    const frPath = path.join(appRoot, 'locales', 'fr.json');
    expect(fs.existsSync(enPath)).toBe(true);
    expect(fs.existsSync(frPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(enPath, 'utf8'))).toEqual({ 'app.title': 'Cell' });
    expect(JSON.parse(fs.readFileSync(frPath, 'utf8'))).toEqual({ 'app.title': 'Cellule' });
    expect(result.issues).toEqual([]);
  });

  it('uses process.cwd() by default when no cwd is supplied', async () => {
    const { workspaceRoot, appRoot } = makeAppFixture();
    cleanup.push(workspaceRoot);
    const originalCwd = process.cwd();
    try {
      process.chdir(appRoot);
      const result = await buildLocalization();
      expect(result.generatedFiles.length).toBeGreaterThan(0);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('resolves app path relative to cwd', async () => {
    const { workspaceRoot, appRoot } = makeAppFixture();
    cleanup.push(workspaceRoot);

    const result = await buildLocalization({
      cwd: path.join(workspaceRoot, 'apps'),
      app: 'web',
    });

    expect(result.config.appRoot).toBe(appRoot);
  });

  it('uses scaffold keys for non-default locales missing translations', async () => {
    const { workspaceRoot, appRoot } = makeAppFixture({
      appMessagesByLocale: {
        en: { 'app.title': 'Cell', 'app.subtitle': 'A subtitle' },
        fr: { 'app.title': 'Cellule' }, // missing app.subtitle
      },
    });
    cleanup.push(workspaceRoot);

    const result = await buildLocalization({ cwd: appRoot });

    const fr = JSON.parse(fs.readFileSync(path.join(appRoot, 'locales', 'fr.json'), 'utf8'));
    expect(fr['app.subtitle']).toBe('');
    expect(fr['app.title']).toBe('Cellule');
    // Warning-level missing-key issue, but build does not throw.
    const missingIssue = result.issues.find((i) => i.message.includes('Missing'));
    expect(missingIssue?.level).toBe('warning');
  });

  it('throws when missing keys are treated as errors via --fail-on-missing', async () => {
    const { workspaceRoot, appRoot } = makeAppFixture({
      appMessagesByLocale: {
        en: { 'app.title': 'Cell', 'app.subtitle': 'A subtitle' },
        fr: { 'app.title': 'Cellule' },
      },
    });
    cleanup.push(workspaceRoot);

    await expect(
      buildLocalization({ cwd: appRoot, failOnMissing: true }),
    ).rejects.toThrow(/Localization build failed/);
  });

  it('config-level failOnMissing applies when CLI flag is not set', async () => {
    const { workspaceRoot, appRoot } = makeAppFixture({
      failOnMissing: true,
      appMessagesByLocale: {
        en: { 'app.title': 'Cell', 'app.subtitle': 'A subtitle' },
        fr: { 'app.title': 'Cellule' },
      },
    });
    cleanup.push(workspaceRoot);

    await expect(buildLocalization({ cwd: appRoot })).rejects.toThrow(
      /Localization build failed/,
    );
  });

  it('handles a single-locale config (en only)', async () => {
    const { workspaceRoot, appRoot } = makeAppFixture({
      supportedLocales: ['en'],
      appMessagesByLocale: { en: { 'app.title': 'Cell' } },
    });
    cleanup.push(workspaceRoot);

    const result = await buildLocalization({ cwd: appRoot });

    expect(result.generatedFiles).toHaveLength(1);
    expect(result.generatedFiles[0].endsWith('en.json')).toBe(true);
  });

  it('sets up chokidar watcher when --watch is enabled and rebuilds on changes', async () => {
    fakeWatcher.handlers.clear();
    const { workspaceRoot, appRoot } = makeAppFixture();
    cleanup.push(workspaceRoot);

    const result = await buildLocalization({ cwd: appRoot, watch: true });

    expect(result.generatedFiles.length).toBeGreaterThan(0);
    expect(chokidar.watch).toHaveBeenCalled();
    // Trigger a watcher event — the 'all' handler should invoke another build.
    fakeWatcher.trigger('all');
  });

  it('in watch mode, swallows build errors instead of throwing', async () => {
    fakeWatcher.handlers.clear();
    const { workspaceRoot, appRoot } = makeAppFixture({
      failOnMissing: true,
      appMessagesByLocale: {
        en: { 'app.title': 'Cell', 'app.subtitle': 'subtitle' },
        fr: { 'app.title': 'Cellule' },
      },
    });
    cleanup.push(workspaceRoot);

    // With watch:true, failOnMissing error should be caught and not thrown.
    const result = await buildLocalization({ cwd: appRoot, watch: true });
    expect(result.issues).toEqual([]);
    expect(result.generatedFiles).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('logs and rethrows in sync mode when underlying build errors', async () => {
    // Create a scenario that causes discoverLocaleSources to fail mid-build.
    const { workspaceRoot, appRoot } = makeAppFixture();
    cleanup.push(workspaceRoot);

    // Remove package.json AFTER config has loaded in buildLocalization?
    // buildLocalization calls resolveBuildConfig first (no package.json needed),
    // then execute() -> runBuild() -> discoverLocaleSources needs package.json.
    fs.rmSync(path.join(appRoot, 'package.json'));

    await expect(buildLocalization({ cwd: appRoot })).rejects.toThrow(
      /No package\.json found/,
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('stringifies non-Error rejections when logging', async () => {
    fakeWatcher.handlers.clear();
    const { workspaceRoot, appRoot } = makeAppFixture();
    cleanup.push(workspaceRoot);

    // Monkey-patch writeFileSync to throw a non-Error value during the build.
    const originalWriteFileSync = fs.writeFileSync;
    const spy = vi
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(((...args: Parameters<typeof fs.writeFileSync>) => {
        // Only sabotage the locale JSON write (preserve any other writes).
        const target = String(args[0]);
        if (target.endsWith('.json')) {
          // Throw a non-Error value to hit the String(error) branch.
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw 'plain-string-rejection';
        }
        return originalWriteFileSync(...args);
      }) as typeof fs.writeFileSync);

    try {
      await expect(buildLocalization({ cwd: appRoot })).rejects.toBe('plain-string-rejection');
      expect(errorSpy).toHaveBeenCalled();
      const loggedMessages = errorSpy.mock.calls.map((call) => String(call[0])).join('\n');
      expect(loggedMessages).toContain('plain-string-rejection');
    } finally {
      spy.mockRestore();
    }
  });
});
