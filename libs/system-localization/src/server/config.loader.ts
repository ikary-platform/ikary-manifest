import fs from 'node:fs';
import path from 'node:path';
import createJiti from 'jiti';
import {
  defineLocalizationConfig,
  localizationConfigSchema,
  type LocalizationConfig,
  type LocalizationValidationConfig,
} from '../shared/index';

export interface LoadedLocalizationConfig {
  appRoot: string;
  configPath: string;
  config: LocalizationConfig;
}

export interface ResolvedBuildConfig extends LoadedLocalizationConfig {
  outputRoot: string;
  validation: LocalizationValidationConfig;
}

const CONFIG_CANDIDATES = [
  'ikary.localization.config.ts',
  'ikary.localization.config.js',
  'ikary.localization.config.mjs',
];

export function resolveAppRoot(cwd: string, appPath?: string): string {
  return path.resolve(cwd, appPath ?? '.');
}

export function loadLocalizationConfig(appRoot: string): LoadedLocalizationConfig {
  const configPath = CONFIG_CANDIDATES.map((candidate) => path.join(appRoot, candidate)).find((candidate) =>
    fs.existsSync(candidate),
  );

  if (!configPath) {
    throw new Error(`No ikary.localization.config.ts found in ${appRoot}. Run \`ikary-admin app init\` first.`);
  }

  const jiti = createJiti(appRoot);
  const imported = jiti(configPath);
  /* v8 ignore next — nullish-coalesce chain; every distinct return path is tested */
  const raw = imported?.localizationConfig ?? imported?.default ?? imported;
  const config = localizationConfigSchema.parse(raw);

  return {
    appRoot,
    configPath,
    config: defineLocalizationConfig(config),
  };
}

export function resolveBuildConfig(appRoot: string): ResolvedBuildConfig {
  const loaded = loadLocalizationConfig(appRoot);

  return {
    ...loaded,
    outputRoot: path.resolve(appRoot, loaded.config.outputDir),
    validation: loaded.config.validation,
  };
}
