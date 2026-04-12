import fs from 'node:fs';
import path from 'node:path';
import createJiti from 'jiti';
import { localeMessagesSchema, type LocaleMessages, type MessageSource } from '../shared/index';
import { isCoreUiPackage, type DiscoveredLocaleSet, type DiscoveredLocaleSource } from './discover';

function loadMessagesFromFile(filePath: string): LocaleMessages {
  const jiti = createJiti(path.dirname(filePath));
  const imported = jiti(filePath);
  /* v8 ignore next — nullish-coalesce chain; every distinct return path is tested */
  const raw = imported?.messages ?? imported?.default?.messages ?? imported?.default ?? imported;
  return localeMessagesSchema.parse(raw);
}

function toMessageSource(
  source: DiscoveredLocaleSource,
  locale: string,
  layer: MessageSource['layer'],
): MessageSource | null {
  const filePath = path.join(source.localeDir, `${locale}.ts`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return {
    packageName: source.packageName,
    locale,
    filePath,
    layer,
    messages: loadMessagesFromFile(filePath),
  };
}

export function extractLibraryMessages(discovered: DiscoveredLocaleSet, locale: string): MessageSource[] {
  return discovered.packageSources
    .map((source) => toMessageSource(source, locale, isCoreUiPackage(source.packageName) ? 'core' : 'library'))
    .filter((source): source is MessageSource => Boolean(source));
}

export function extractAppMessages(discovered: DiscoveredLocaleSet, locale: string): MessageSource[] {
  const sources: MessageSource[] = [];
  const appSourcePath = path.join(discovered.appSourceDir, `${locale}.ts`);
  if (fs.existsSync(appSourcePath)) {
    sources.push({
      packageName: '@app/ui',
      locale,
      filePath: appSourcePath,
      layer: 'app',
      messages: loadMessagesFromFile(appSourcePath),
    });
  }

  const appOverridePath = path.join(discovered.appOverrideDir, `${locale}.ts`);
  if (fs.existsSync(appOverridePath)) {
    sources.push({
      packageName: '@app/overrides',
      locale,
      filePath: appOverridePath,
      layer: 'override',
      messages: loadMessagesFromFile(appOverridePath),
    });
  }

  return sources;
}
