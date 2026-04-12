import fs from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import { buildLocalization } from './build';
import { registerI18nExtractCommand, registerI18nMissingCommand, registerI18nSyncCommand } from './i18n';
import { resolveAppRoot } from './config.loader';

function parseLocales(input: string): string[] {
  return input
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function renderConfig(defaultLocale: string, supportedLocales: string[]): string {
  const localesLiteral = supportedLocales.map((locale) => `'${locale}'`).join(', ');
  return `import { defineLocalizationConfig } from '@ikary/system-localization';\n\nexport const localizationConfig = defineLocalizationConfig({\n  defaultLocale: '${defaultLocale}',\n  supportedLocales: [${localesLiteral}],\n  outputDir: 'locales',\n  validation: {\n    failOnMissing: false,\n    failOnDuplicate: true\n  }\n});\n\nexport default localizationConfig;\n`;
}

function renderAppEnglishTemplate(): string {
  return `export const messages = {\n  'app.title': 'Cell'\n} as const;\n`;
}

function renderOverrideTemplate(): string {
  return `export const messages = {} as const;\n`;
}

export function registerLocalizationBuildCommand(parent: Command): void {
  parent
    .command('build')
    .description('Discover, validate, and generate locale JSON for an cell')
    .option('--app <path>', 'Cell package root', '.')
    .option('--watch', 'Watch locale sources and rebuild on change', false)
    .option('--fail-on-missing', 'Treat missing translated keys as errors', false)
    .option('--fail-on-duplicate', 'Treat duplicate message ids as errors', false)
    .action(async (options: { app: string; watch?: boolean; failOnMissing?: boolean; failOnDuplicate?: boolean }) => {
      await buildLocalization({
        cwd: process.cwd(),
        app: options.app,
        watch: options.watch,
        failOnMissing: options.failOnMissing ? true : undefined,
        failOnDuplicate: options.failOnDuplicate ? true : undefined,
      });
    });
}

export function registerAppInitCommand(parent: Command): void {
  parent
    .command('init')
    .description('Initialize localization configuration for an cell package')
    .option('--path <path>', 'Cell package root', '.')
    .requiredOption('--default-locale <locale>', 'Default locale for the cell')
    .requiredOption('--locales <locales>', 'Comma-separated supported locales')
    .option('--force', 'Overwrite existing localization files', false)
    .action(async (options: { path: string; defaultLocale: string; locales: string; force?: boolean }) => {
      const appRoot = resolveAppRoot(process.cwd(), options.path);
      const supportedLocales = parseLocales(options.locales);
      if (!supportedLocales.includes(options.defaultLocale)) {
        throw new Error('The default locale must be present in --locales.');
      }

      const configPath = path.join(appRoot, 'ikary.localization.config.ts');
      const sourceDir = path.join(appRoot, 'src', 'locales');
      const overrideDir = path.join(sourceDir, 'overrides');
      const outputDir = path.join(appRoot, 'locales');

      fs.mkdirSync(sourceDir, { recursive: true });
      fs.mkdirSync(overrideDir, { recursive: true });
      fs.mkdirSync(outputDir, { recursive: true });

      const writes: Array<{ filePath: string; contents: string }> = [
        {
          filePath: configPath,
          contents: renderConfig(options.defaultLocale, supportedLocales),
        },
        {
          filePath: path.join(sourceDir, 'en.ts'),
          contents: renderAppEnglishTemplate(),
        },
        {
          filePath: path.join(overrideDir, 'en.ts'),
          contents: renderOverrideTemplate(),
        },
      ];

      for (const write of writes) {
        if (!options.force && fs.existsSync(write.filePath)) {
          continue;
        }

        fs.writeFileSync(write.filePath, write.contents, 'utf8');
      }

      console.log(`Initialized localization config in ${appRoot}.`);
    });
}

export { registerI18nExtractCommand, registerI18nMissingCommand, registerI18nSyncCommand };
