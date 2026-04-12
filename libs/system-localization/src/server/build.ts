import fs from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';
import chalk from 'chalk';
import type { LocalizationValidationConfig } from '../shared/index';
import { resolveBuildConfig, resolveAppRoot, type ResolvedBuildConfig } from './config.loader';
import { discoverLocaleSources } from './discover';
import { extractAppMessages, extractLibraryMessages } from './extract';
import { buildScaffoldLocale, mergeLocaleCatalog } from './merge';
import { validateDuplicates, validateLocaleKeys, type LocaleValidationIssue } from './validate';

export interface LocalizationBuildOptions {
  cwd?: string;
  app?: string;
  watch?: boolean;
  failOnMissing?: boolean;
  failOnDuplicate?: boolean;
}

export interface BuildResult {
  config: ResolvedBuildConfig;
  issues: LocaleValidationIssue[];
  generatedFiles: string[];
}

function normalizeValidation(
  config: ResolvedBuildConfig,
  options: LocalizationBuildOptions,
): LocalizationValidationConfig {
  return {
    failOnMissing: options.failOnMissing ?? config.validation.failOnMissing,
    failOnDuplicate: options.failOnDuplicate ?? config.validation.failOnDuplicate,
  };
}

function writeLocaleJson(outputRoot: string, locale: string, messages: Record<string, string>): string {
  fs.mkdirSync(outputRoot, { recursive: true });
  const outputPath = path.join(outputRoot, `${locale}.json`);
  fs.writeFileSync(outputPath, `${JSON.stringify(messages, null, 2)}\n`, 'utf8');
  return outputPath;
}

function printIssues(issues: LocaleValidationIssue[]): void {
  for (const issue of issues) {
    const label = issue.level === 'error' ? chalk.red('error') : chalk.yellow('warning');
    console.log(`${label} [${issue.locale}] ${issue.message}`);
  }
}

async function runBuild(config: ResolvedBuildConfig, options: LocalizationBuildOptions): Promise<BuildResult> {
  const validation = normalizeValidation(config, options);
  const discovered = discoverLocaleSources(config.appRoot);
  const englishSources = [...extractLibraryMessages(discovered, 'en'), ...extractAppMessages(discovered, 'en')];
  const englishCatalog = mergeLocaleCatalog('en', englishSources);
  const issues = validateDuplicates(englishCatalog.duplicates, validation);
  const generatedFiles: string[] = [];

  generatedFiles.push(writeLocaleJson(config.outputRoot, 'en', englishCatalog.messages));

  for (const locale of config.config.supportedLocales) {
    if (locale === 'en') {
      continue;
    }

    const localeSources = [...extractLibraryMessages(discovered, locale), ...extractAppMessages(discovered, locale)];
    const localeCatalog = mergeLocaleCatalog(locale, localeSources);
    issues.push(...validateDuplicates(localeCatalog.duplicates, validation));
    issues.push(...validateLocaleKeys(englishCatalog.messages, localeCatalog.messages, locale, validation));

    const scaffold = buildScaffoldLocale(englishCatalog.messages, localeCatalog.messages);
    generatedFiles.push(writeLocaleJson(config.outputRoot, locale, scaffold));
  }

  if (issues.length > 0) {
    printIssues(issues);
  }

  const hasErrors = issues.some((issue) => issue.level === 'error');
  if (hasErrors) {
    throw new Error('Localization build failed due to validation errors.');
  }

  console.log(chalk.green(`Localization build completed for ${config.appRoot}.`));
  for (const filePath of generatedFiles) {
    console.log(chalk.gray(`  wrote ${path.relative(config.appRoot, filePath)}`));
  }

  return {
    config,
    issues,
    generatedFiles,
  };
}

export async function buildLocalization(options: LocalizationBuildOptions = {}): Promise<BuildResult> {
  const cwd = options.cwd ?? process.cwd();
  const appRoot = resolveAppRoot(cwd, options.app);
  const config = resolveBuildConfig(appRoot);

  const execute = () =>
    runBuild(config, options).catch((error) => {
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      if (!options.watch) {
        throw error;
      }
      return Promise.resolve({ config, issues: [], generatedFiles: [] });
    });

  const result = await execute();

  if (!options.watch) {
    return result;
  }

  const discovered = discoverLocaleSources(config.appRoot);
  const watchPaths = [
    config.configPath,
    discovered.packageJsonPath,
    discovered.appSourceDir,
    discovered.appOverrideDir,
    ...discovered.packageSources.map((source) => source.localeDir),
  ];

  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
  });

  watcher.on('all', () => {
    void execute();
  });

  console.log(chalk.cyan('Watching localization sources for changes...'));

  return result;
}
