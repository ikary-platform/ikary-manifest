import fs from 'node:fs';
import path from 'node:path';

export interface DiscoveredLocaleSource {
  packageName: string;
  packageRoot: string;
  localeDir: string;
}

export interface DiscoveredLocaleSet {
  appRoot: string;
  packageJsonPath: string;
  packageSources: DiscoveredLocaleSource[];
  appSourceDir: string;
  appOverrideDir: string;
}

const CORE_UI_PACKAGES = new Set([
  '@ikary/system-app-shell-ui',
  '@ikary/system-auth-session-ui',
  '@ikary/system-auth-ui',
  '@ikary/system-branding-ui',
  '@ikary/system-localization',
]);

/** Packages whose UI locales live at `src/ui/locales` (mixed packages) instead of `src/locales`. */
const MIXED_UI_PACKAGES = new Set(['@ikary/system-localization']);

interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function readPackageJson(appRoot: string): PackageJsonLike {
  const packageJsonPath = path.join(appRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`No package.json found in ${appRoot}.`);
  }

  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJsonLike;
}

function listMicroUiPackages(packageJson: PackageJsonLike): string[] {
  const names = new Set<string>();
  const groups: Array<keyof PackageJsonLike> = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ];

  for (const group of groups) {
    const dependencies = packageJson[group] ?? {};
    for (const packageName of Object.keys(dependencies)) {
      if (packageName.startsWith('@ikary/') && (packageName.endsWith('-ui') || MIXED_UI_PACKAGES.has(packageName))) {
        names.add(packageName);
      }
    }
  }

  return [...names].sort((left, right) => left.localeCompare(right));
}

function resolvePackageRoot(appRoot: string, packageName: string): string {
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`, { paths: [appRoot] });
    return path.dirname(packageJsonPath);
  } catch {
    const workspaceRoot = path.resolve(appRoot, '..', '..');
    const candidate = path.join(workspaceRoot, 'libs', packageName.replace('@ikary/', ''));
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }

    throw new Error(`Unable to resolve package root for ${packageName} from ${appRoot}.`);
  }
}

export function discoverLocaleSources(appRoot: string): DiscoveredLocaleSet {
  const packageJsonPath = path.join(appRoot, 'package.json');
  const packageJson = readPackageJson(appRoot);
  const packageNames = listMicroUiPackages(packageJson);

  const packageSources = packageNames
    .map((packageName) => {
      const packageRoot = resolvePackageRoot(appRoot, packageName);
      const localeDir = MIXED_UI_PACKAGES.has(packageName)
        ? path.join(packageRoot, 'src', 'ui', 'locales')
        : path.join(packageRoot, 'src', 'locales');
      return {
        packageName,
        packageRoot,
        localeDir,
      };
    })
    .filter((source) => fs.existsSync(path.join(source.localeDir, 'en.ts')));

  return {
    appRoot,
    packageJsonPath,
    packageSources,
    appSourceDir: path.join(appRoot, 'src', 'locales'),
    appOverrideDir: path.join(appRoot, 'src', 'locales', 'overrides'),
  };
}

export function isCoreUiPackage(packageName: string): boolean {
  return CORE_UI_PACKAGES.has(packageName);
}
