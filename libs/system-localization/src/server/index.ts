export { buildLocalization } from './build';
export type { LocalizationBuildOptions, BuildResult } from './build';

export {
  loadLocalizationConfig,
  resolveAppRoot,
  resolveBuildConfig,
} from './config.loader';
export type { LoadedLocalizationConfig, ResolvedBuildConfig } from './config.loader';

export {
  discoverLocaleSources,
  isCoreUiPackage,
} from './discover';
export type { DiscoveredLocaleSet, DiscoveredLocaleSource } from './discover';

export {
  extractLibraryMessages,
  extractAppMessages,
} from './extract';

export {
  extractI18nCatalog,
  registerI18nExtractCommand,
  registerI18nMissingCommand,
  registerI18nSyncCommand,
} from './i18n';
export type { ExtractedCatalog } from './i18n';

export {
  mergeLocaleCatalog,
  buildScaffoldLocale,
} from './merge';
export type { MergedLocaleCatalog } from './merge';

export {
  validateDuplicates,
  validateLocaleKeys,
} from './validate';
export type { LocaleValidationIssue, ValidationOptions } from './validate';

export {
  registerLocalizationBuildCommand,
  registerAppInitCommand,
} from './cli';
