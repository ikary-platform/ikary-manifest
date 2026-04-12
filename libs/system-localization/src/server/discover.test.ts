import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { discoverLocaleSources, isCoreUiPackage } from './discover';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'loc-test-'));
}

function removeDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

interface WorkspaceFixture {
  workspaceRoot: string;
  appRoot: string;
}

/**
 * Creates a workspace where the app sits at `<temp>/apps/web` so
 * `resolve('..', '..')` lands at the workspace root and finds packages
 * beneath `<temp>/libs/<name>`.
 */
function makeWorkspace(packageJson: Record<string, unknown>): WorkspaceFixture {
  const workspaceRoot = makeTempDir();
  const appRoot = path.join(workspaceRoot, 'apps', 'web');
  fs.mkdirSync(appRoot, { recursive: true });
  fs.writeFileSync(path.join(appRoot, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8');
  return { workspaceRoot, appRoot };
}

function writeLibPackage(
  workspaceRoot: string,
  packageName: string,
  options: { withEnFile?: boolean; mixed?: boolean } = { withEnFile: true },
): void {
  const slug = packageName.replace('@ikary/', '');
  const pkgRoot = path.join(workspaceRoot, 'libs', slug);
  fs.mkdirSync(pkgRoot, { recursive: true });
  fs.writeFileSync(
    path.join(pkgRoot, 'package.json'),
    JSON.stringify({ name: packageName, version: '0.0.0' }),
    'utf8',
  );

  const localeDir = options.mixed
    ? path.join(pkgRoot, 'src', 'ui', 'locales')
    : path.join(pkgRoot, 'src', 'locales');
  fs.mkdirSync(localeDir, { recursive: true });
  if (options.withEnFile !== false) {
    fs.writeFileSync(path.join(localeDir, 'en.ts'), "export const messages = {};\n", 'utf8');
  }
}

describe('isCoreUiPackage', () => {
  it('returns true for known core UI packages', () => {
    expect(isCoreUiPackage('@ikary/system-app-shell-ui')).toBe(true);
    expect(isCoreUiPackage('@ikary/system-auth-session-ui')).toBe(true);
    expect(isCoreUiPackage('@ikary/system-auth-ui')).toBe(true);
    expect(isCoreUiPackage('@ikary/system-branding-ui')).toBe(true);
    expect(isCoreUiPackage('@ikary/system-localization')).toBe(true);
  });

  it('returns false for unknown packages', () => {
    expect(isCoreUiPackage('@ikary/some-other-ui')).toBe(false);
    expect(isCoreUiPackage('@example/thing')).toBe(false);
  });
});

describe('discoverLocaleSources', () => {
  const cleanup: string[] = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      const dir = cleanup.pop();
      if (dir) {
        removeDir(dir);
      }
    }
  });

  it('throws when package.json is missing', () => {
    const tempDir = makeTempDir();
    cleanup.push(tempDir);
    expect(() => discoverLocaleSources(tempDir)).toThrow(/No package\.json found/);
  });

  it('scans @ikary/*-ui dependencies and returns discovered sources', () => {
    const { workspaceRoot, appRoot } = makeWorkspace({
      name: 'app',
      dependencies: {
        '@ikary/example-ui': '*',
        react: '^19.0.0',
      },
    });
    cleanup.push(workspaceRoot);
    writeLibPackage(workspaceRoot, '@ikary/example-ui');

    const discovered = discoverLocaleSources(appRoot);

    expect(discovered.appRoot).toBe(appRoot);
    expect(discovered.packageJsonPath).toBe(path.join(appRoot, 'package.json'));
    expect(discovered.appSourceDir).toBe(path.join(appRoot, 'src', 'locales'));
    expect(discovered.appOverrideDir).toBe(path.join(appRoot, 'src', 'locales', 'overrides'));
    expect(discovered.packageSources).toHaveLength(1);
    expect(discovered.packageSources[0].packageName).toBe('@ikary/example-ui');
    expect(discovered.packageSources[0].localeDir).toBe(
      path.join(workspaceRoot, 'libs', 'example-ui', 'src', 'locales'),
    );
  });

  it('handles @ikary/system-localization as a mixed UI package (src/ui/locales)', () => {
    const { workspaceRoot, appRoot } = makeWorkspace({
      name: 'app',
      dependencies: {
        '@ikary/system-localization': '*',
      },
    });
    cleanup.push(workspaceRoot);

    const discovered = discoverLocaleSources(appRoot);

    expect(discovered.packageSources).toHaveLength(1);
    const source = discovered.packageSources[0];
    expect(source.packageName).toBe('@ikary/system-localization');
    // Mixed packages use src/ui/locales rather than src/locales.
    expect(source.localeDir.endsWith(path.join('src', 'ui', 'locales'))).toBe(true);
    // en.ts must exist at the resolved locale dir (filter would have dropped it otherwise).
    expect(fs.existsSync(path.join(source.localeDir, 'en.ts'))).toBe(true);
  });

  it('filters out packages without an en.ts locale file', () => {
    const { workspaceRoot, appRoot } = makeWorkspace({
      name: 'app',
      dependencies: {
        '@ikary/has-locale-ui': '*',
        '@ikary/no-locale-ui': '*',
      },
    });
    cleanup.push(workspaceRoot);
    writeLibPackage(workspaceRoot, '@ikary/has-locale-ui', { withEnFile: true });
    writeLibPackage(workspaceRoot, '@ikary/no-locale-ui', { withEnFile: false });

    const discovered = discoverLocaleSources(appRoot);
    const names = discovered.packageSources.map((source) => source.packageName);

    expect(names).toEqual(['@ikary/has-locale-ui']);
  });

  it('ignores non-matching packages and dedupes across dep groups', () => {
    const { workspaceRoot, appRoot } = makeWorkspace({
      name: 'app',
      dependencies: {
        '@ikary/foo-ui': '*',
        'react': '^19.0.0',
        'some-other/package': '*',
      },
      devDependencies: {
        '@ikary/foo-ui': '*',
      },
      peerDependencies: {
        '@ikary/foo-ui': '*',
      },
      optionalDependencies: {
        '@ikary/foo-ui': '*',
      },
    });
    cleanup.push(workspaceRoot);
    writeLibPackage(workspaceRoot, '@ikary/foo-ui');

    const discovered = discoverLocaleSources(appRoot);

    expect(discovered.packageSources.map((s) => s.packageName)).toEqual(['@ikary/foo-ui']);
  });

  it('throws when a discovered package cannot be resolved anywhere', () => {
    const { workspaceRoot, appRoot } = makeWorkspace({
      name: 'app',
      dependencies: {
        '@ikary/missing-ui': '*',
      },
    });
    cleanup.push(workspaceRoot);
    // Intentionally don't create the lib for '@ikary/missing-ui'.

    expect(() => discoverLocaleSources(appRoot)).toThrow(/Unable to resolve package root/);
  });

  it('returns empty packageSources when no @ikary UI deps exist', () => {
    const { workspaceRoot, appRoot } = makeWorkspace({
      name: 'app',
      dependencies: { react: '^19.0.0' },
    });
    cleanup.push(workspaceRoot);

    const discovered = discoverLocaleSources(appRoot);

    expect(discovered.packageSources).toEqual([]);
  });

  it('handles a package.json with no dependency groups at all', () => {
    const { workspaceRoot, appRoot } = makeWorkspace({ name: 'app' });
    cleanup.push(workspaceRoot);

    const discovered = discoverLocaleSources(appRoot);

    expect(discovered.packageSources).toEqual([]);
  });
});
