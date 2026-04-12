import { resolve, join } from 'node:path';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import {
  buildLocalization,
  extractI18nCatalog,
  resolveAppRoot,
} from '@ikary/system-localization/server';
import * as fmt from '../output/format.js';
import { theme } from '../output/theme.js';

// ── init ─────────────────────────────────────────────────────────────────

function renderConfigTemplate(defaultLocale: string, supportedLocales: string[]): string {
  const localesLiteral = supportedLocales.map((l) => `'${l}'`).join(', ');
  return `import { defineLocalizationConfig } from '@ikary/system-localization';

export const localizationConfig = defineLocalizationConfig({
  defaultLocale: '${defaultLocale}',
  supportedLocales: [${localesLiteral}],
  outputDir: 'locales',
  validation: {
    failOnMissing: false,
    failOnDuplicate: true,
  },
});

export default localizationConfig;
`;
}

function renderAppEnglishTemplate(): string {
  return `export const messages = {\n  'app.title': 'Cell'\n} as const;\n`;
}

function renderOverrideTemplate(): string {
  return `export const messages = {} as const;\n`;
}

function parseLocales(input: string): string[] {
  return input
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function localizeInitCommand(options: {
  path?: string;
  defaultLocale?: string;
  locales?: string;
  force?: boolean;
}): Promise<void> {
  fmt.section('Initializing localization');
  fmt.newline();

  try {
    const appRoot = resolveAppRoot(process.cwd(), options.path);
    const defaultLocale = options.defaultLocale ?? 'en';
    const supportedLocales = parseLocales(options.locales ?? defaultLocale);

    if (!supportedLocales.includes(defaultLocale)) {
      fmt.error(`Default locale ${theme.accent(defaultLocale)} must be present in --locales (${supportedLocales.join(', ')}).`);
      process.exitCode = 1;
      return;
    }

    const spinner = fmt.createSpinner('Scaffolding localization files...');
    spinner.start();

    const configPath = join(appRoot, 'ikary.localization.config.ts');
    const sourceDir = join(appRoot, 'src', 'locales');
    const overrideDir = join(sourceDir, 'overrides');
    const outputDir = join(appRoot, 'locales');

    mkdirSync(sourceDir, { recursive: true });
    mkdirSync(overrideDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    const writes: Array<{ filePath: string; contents: string; label: string }> = [
      {
        filePath: configPath,
        contents: renderConfigTemplate(defaultLocale, supportedLocales),
        label: 'ikary.localization.config.ts',
      },
      {
        filePath: join(sourceDir, `${defaultLocale}.ts`),
        contents: renderAppEnglishTemplate(),
        label: `src/locales/${defaultLocale}.ts`,
      },
      {
        filePath: join(overrideDir, `${defaultLocale}.ts`),
        contents: renderOverrideTemplate(),
        label: `src/locales/overrides/${defaultLocale}.ts`,
      },
    ];

    const written: string[] = [];
    for (const write of writes) {
      if (!options.force && existsSync(write.filePath)) {
        continue;
      }
      writeFileSync(write.filePath, write.contents, 'utf8');
      written.push(write.label);
    }

    spinner.succeed(theme.success('Localization initialized'));
    fmt.newline();

    if (written.length === 0) {
      fmt.muted('All files already exist. Use --force to overwrite.');
    } else {
      fmt.body('Created:');
      for (const label of written) {
        fmt.body(`  ${theme.accent(label)}`);
      }
    }

    fmt.newline();
    fmt.body('Next steps:');
    fmt.newline();
    fmt.body(`  1. Edit ${theme.accent(`src/locales/${defaultLocale}.ts`)} to add translations.`);
    fmt.body(`  2. Run ${theme.accent('ikary localize build')} to generate ${theme.accent('locales/*.json')}.`);
    fmt.newline();
  } catch (err) {
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}

// ── build ────────────────────────────────────────────────────────────────

export async function localizeBuildCommand(options: {
  app?: string;
  watch?: boolean;
  failOnMissing?: boolean;
  failOnDuplicate?: boolean;
}): Promise<void> {
  fmt.section('Building localization catalogs');
  fmt.newline();

  const spinner = fmt.createSpinner('Discovering and merging locale sources...');
  spinner.start();

  try {
    const result = await buildLocalization({
      cwd: process.cwd(),
      app: options.app,
      watch: options.watch,
      failOnMissing: options.failOnMissing ? true : undefined,
      failOnDuplicate: options.failOnDuplicate ? true : undefined,
    });

    const errors = result.issues.filter((i) => i.level === 'error');
    const warnings = result.issues.filter((i) => i.level === 'warning');

    if (errors.length > 0) {
      spinner.fail(theme.error(`Build failed with ${errors.length} error(s)`));
      fmt.newline();
      for (const err of errors) {
        fmt.error(`  [${err.locale}] ${err.message}`);
      }
      for (const warn of warnings) {
        fmt.muted(`  [${warn.locale}] ${warn.message}`);
      }
      process.exitCode = 1;
      return;
    }

    spinner.succeed(theme.success(`Generated ${result.generatedFiles.length} locale file(s)`));
    fmt.newline();

    for (const file of result.generatedFiles) {
      fmt.body(`  ${theme.accent(resolve(file).replace(process.cwd() + '/', ''))}`);
    }

    if (warnings.length > 0) {
      fmt.newline();
      fmt.body('Warnings:');
      for (const warn of warnings) {
        fmt.muted(`  [${warn.locale}] ${warn.message}`);
      }
    }

    fmt.newline();
  } catch (err) {
    spinner.fail(theme.error('Build failed'));
    fmt.newline();
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}

// ── extract ──────────────────────────────────────────────────────────────

export async function localizeExtractCommand(options: { app?: string }): Promise<void> {
  fmt.section('Extracting translation keys');
  fmt.newline();

  const spinner = fmt.createSpinner('Scanning source files for translation keys...');
  spinner.start();

  try {
    const appRoot = resolveAppRoot(process.cwd(), options.app);
    const { keys, catalog } = extractI18nCatalog(appRoot);

    const catalogPath = join(appRoot, 'translations.catalog.json');
    writeFileSync(
      catalogPath,
      JSON.stringify({ generatedAt: new Date().toISOString(), keys, catalog }, null, 2),
      'utf8',
    );

    spinner.succeed(theme.success(`Extracted ${keys.length} key(s)`));
    fmt.newline();
    fmt.body(`Wrote catalog to ${theme.accent('translations.catalog.json')}`);
    fmt.newline();
  } catch (err) {
    spinner.fail(theme.error('Extraction failed'));
    fmt.newline();
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}

// ── missing ──────────────────────────────────────────────────────────────

interface LoadedCatalog {
  generatedAt?: string;
  keys: string[];
  catalog: Record<string, string>;
}

function loadExtractedCatalog(appRoot: string): LoadedCatalog {
  const catalogPath = join(appRoot, 'translations.catalog.json');
  if (!existsSync(catalogPath)) {
    throw new Error(`Catalog not found at ${catalogPath}. Run \`ikary localize extract\` first.`);
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const raw = require('node:fs').readFileSync(catalogPath, 'utf8') as string;
  return JSON.parse(raw) as LoadedCatalog;
}

function loadLocaleJson(appRoot: string, lang: string): Record<string, string> {
  const localePath = join(appRoot, 'locales', `${lang}.json`);
  if (!existsSync(localePath)) {
    return {};
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const raw = require('node:fs').readFileSync(localePath, 'utf8') as string;
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const output: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v === 'string') output[k] = v;
  }
  return output;
}

export async function localizeMissingCommand(options: {
  app?: string;
  lang: string;
  strict?: boolean;
}): Promise<void> {
  fmt.section(`Checking translation coverage for ${options.lang}`);
  fmt.newline();

  try {
    const appRoot = resolveAppRoot(process.cwd(), options.app);
    const { keys } = loadExtractedCatalog(appRoot);
    const translations = loadLocaleJson(appRoot, options.lang);

    const missing = keys.filter((k) => !translations[k] || translations[k].trim() === '');
    const total = keys.length;
    const translated = total - missing.length;
    const coverage = total === 0 ? 100 : Math.round((translated / total) * 100);

    fmt.body(`Coverage: ${theme.accent(`${coverage}%`)} (${translated}/${total} keys)`);

    if (missing.length > 0) {
      fmt.newline();
      fmt.body(`Missing ${missing.length} key(s):`);
      for (const key of missing.slice(0, 20)) {
        fmt.muted(`  ${key}`);
      }
      if (missing.length > 20) {
        fmt.muted(`  ... and ${missing.length - 20} more`);
      }
      fmt.newline();
      if (options.strict) {
        process.exitCode = 1;
      }
    } else {
      fmt.newline();
      fmt.success('All keys are translated.');
      fmt.newline();
    }
  } catch (err) {
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}

// ── sync ─────────────────────────────────────────────────────────────────

export async function localizeSyncCommand(options: {
  app?: string;
  check?: boolean;
}): Promise<void> {
  fmt.section('Syncing extracted keys with catalog');
  fmt.newline();

  try {
    const appRoot = resolveAppRoot(process.cwd(), options.app);
    const extracted = extractI18nCatalog(appRoot);
    const catalogPath = join(appRoot, 'translations.catalog.json');

    if (!existsSync(catalogPath)) {
      if (options.check) {
        fmt.error(`No catalog found at ${catalogPath}.`);
        process.exitCode = 1;
        return;
      }
      writeFileSync(
        catalogPath,
        JSON.stringify({ generatedAt: new Date().toISOString(), ...extracted }, null, 2),
        'utf8',
      );
      fmt.success(`Created catalog with ${extracted.keys.length} key(s).`);
      fmt.newline();
      return;
    }

    const existing = loadExtractedCatalog(appRoot);
    const currentKeys = new Set(extracted.keys);
    const existingKeys = new Set(existing.keys);

    const added = [...currentKeys].filter((k) => !existingKeys.has(k));
    const removed = [...existingKeys].filter((k) => !currentKeys.has(k));

    if (added.length === 0 && removed.length === 0) {
      fmt.success('Catalog is up to date.');
      fmt.newline();
      return;
    }

    if (options.check) {
      fmt.error(`Catalog is out of sync with source (${added.length} added, ${removed.length} removed).`);
      if (added.length > 0) {
        fmt.body('Added keys:');
        for (const k of added.slice(0, 10)) fmt.muted(`  + ${k}`);
      }
      if (removed.length > 0) {
        fmt.body('Removed keys:');
        for (const k of removed.slice(0, 10)) fmt.muted(`  - ${k}`);
      }
      fmt.newline();
      process.exitCode = 1;
      return;
    }

    writeFileSync(
      catalogPath,
      JSON.stringify({ generatedAt: new Date().toISOString(), ...extracted }, null, 2),
      'utf8',
    );
    fmt.success(`Updated catalog: +${added.length} / -${removed.length} keys.`);
    fmt.newline();
  } catch (err) {
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}
