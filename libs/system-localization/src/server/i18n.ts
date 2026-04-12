import fs from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import { resolveAppRoot } from './config.loader';

export interface ExtractedCatalog {
  keys: string[];
  catalog: Record<string, string>;
}

const KEY_REGEXES = [
  /\bt\(\s*['"`]([a-z0-9_]+(?:\.[a-z0-9_]+)+)['"`]/g,
  /<T\s+[^>]*id=["']([a-z0-9_]+(?:\.[a-z0-9_]+)+)["'][^>]*>/g,
  /formatMessage\(\s*\{\s*id\s*:\s*['"`]([a-z0-9_]+(?:\.[a-z0-9_]+)+)['"`]/g,
];

function collectFiles(dir: string, output: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return output;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === 'build' ||
        entry.name === 'coverage'
      ) {
        continue;
      }

      collectFiles(path.join(dir, entry.name), output);
      continue;
    }

    if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      continue;
    }

    output.push(path.join(dir, entry.name));
  }

  return output;
}

function extractKeysFromSource(source: string): string[] {
  const keys = new Set<string>();

  for (const regex of KEY_REGEXES) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null = regex.exec(source);
    while (match) {
      if (match[1]) {
        keys.add(match[1]);
      }
      match = regex.exec(source);
    }
  }

  return [...keys];
}

export function extractI18nCatalog(appRoot: string): ExtractedCatalog {
  const srcRoot = path.join(appRoot, 'src');
  const files = collectFiles(srcRoot);
  const keys = new Set<string>();

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, 'utf8');
    for (const key of extractKeysFromSource(source)) {
      keys.add(key);
    }
  }

  const sorted = [...keys].sort((left, right) => left.localeCompare(right));
  return {
    keys: sorted,
    catalog: Object.fromEntries(sorted.map((key) => [key, ''])),
  };
}

function writeCatalog(appRoot: string, catalog: ExtractedCatalog): string {
  const outputPath = path.join(appRoot, 'translations.catalog.json');
  const payload = {
    generatedAt: new Date().toISOString(),
    keys: catalog.keys,
    catalog: catalog.catalog,
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return outputPath;
}

function loadLocaleJsonCatalog(appRoot: string, language: string): Record<string, string> {
  const filePath = path.join(appRoot, 'locales', `${language}.json`);
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = typeof value === 'string' ? value : String(value ?? '');
  }

  return normalized;
}

function arraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export function registerI18nExtractCommand(parent: Command): void {
  parent
    .command('extract')
    .description('Extract translation keys from source and write translations.catalog.json')
    .option('--app <path>', 'Application root path', '.')
    .action(async (options: { app: string }) => {
      const appRoot = resolveAppRoot(process.cwd(), options.app);
      const catalog = extractI18nCatalog(appRoot);
      const outputPath = writeCatalog(appRoot, catalog);
      console.log(`Extracted ${catalog.keys.length} keys to ${outputPath}.`);
    });
}

export function registerI18nMissingCommand(parent: Command): void {
  parent
    .command('missing')
    .description('Show missing keys for a locale based on extracted source keys')
    .requiredOption('--lang <code>', 'Language code (for example: fr)')
    .option('--app <path>', 'Application root path', '.')
    .option('--strict', 'Exit with non-zero status when missing keys exist', false)
    .action(async (options: { lang: string; app: string; strict?: boolean }) => {
      const appRoot = resolveAppRoot(process.cwd(), options.app);
      const catalog = extractI18nCatalog(appRoot);
      const localeCatalog = loadLocaleJsonCatalog(appRoot, options.lang);
      const missing = catalog.keys.filter((key) => !(key in localeCatalog) || localeCatalog[key].trim().length === 0);

      console.log(
        `Language ${options.lang}: ${catalog.keys.length - missing.length}/${catalog.keys.length} keys translated.`,
      );
      if (missing.length > 0) {
        console.log(`Missing (${missing.length}):`);
        for (const key of missing) {
          console.log(`- ${key}`);
        }
      }

      if (options.strict && missing.length > 0) {
        throw new Error(`Missing ${missing.length} translation keys for ${options.lang}.`);
      }
    });
}

export function registerI18nSyncCommand(parent: Command): void {
  parent
    .command('sync')
    .description('Sync extracted keys into translations.catalog.json (check mode fails on drift)')
    .option('--app <path>', 'Application root path', '.')
    .option('--check', 'Fail if translations.catalog.json differs from current extraction', false)
    .action(async (options: { app: string; check?: boolean }) => {
      const appRoot = resolveAppRoot(process.cwd(), options.app);
      const extracted = extractI18nCatalog(appRoot);
      const outputPath = path.join(appRoot, 'translations.catalog.json');
      const existing = fs.existsSync(outputPath)
        ? (JSON.parse(fs.readFileSync(outputPath, 'utf8')) as { keys?: string[] })
        : null;
      const existingKeys = Array.isArray(existing?.keys) ? [...existing!.keys].sort((a, b) => a.localeCompare(b)) : [];

      if (options.check) {
        if (!arraysEqual(extracted.keys, existingKeys)) {
          throw new Error('translations.catalog.json is out of sync. Run `microapp i18n sync --app <path>`.');
        }

        console.log('translations.catalog.json is in sync.');
        return;
      }

      if (arraysEqual(extracted.keys, existingKeys) && fs.existsSync(outputPath)) {
        console.log(`translations.catalog.json already in sync (${outputPath}).`);
        return;
      }

      writeCatalog(appRoot, extracted);
      console.log(`Synchronized ${extracted.keys.length} keys into ${outputPath}.`);
    });
}
