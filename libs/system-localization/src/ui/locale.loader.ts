import type { LocaleMessages } from '../shared/index';

export type LocaleModule = LocaleMessages | { default: LocaleMessages };
export type LocaleLoader = () => Promise<LocaleModule>;
export type LocaleLoaderMap = Record<string, LocaleLoader>;

export function normalizeLocaleModule(module: LocaleModule): LocaleMessages {
  return ('default' in module ? module.default : module) as LocaleMessages;
}

export function createLocaleLoaders(globResult: Record<string, () => Promise<LocaleModule>>): LocaleLoaderMap {
  const loaders: LocaleLoaderMap = {};

  for (const [filePath, loader] of Object.entries(globResult)) {
    const match = filePath.match(/\/([A-Za-z-]+)\.json$/);
    if (!match) {
      continue;
    }

    loaders[match[1]] = loader;
  }

  return loaders;
}
