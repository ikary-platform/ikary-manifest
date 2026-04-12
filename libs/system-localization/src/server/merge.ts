import {
  createLocaleScaffold,
  mergeMessageSources,
  type DuplicateMessage,
  type LocaleMessages,
  type MessageSource,
} from '../shared/index';

export interface MergedLocaleCatalog {
  locale: string;
  messages: LocaleMessages;
  duplicates: DuplicateMessage[];
  sources: MessageSource[];
}

export function mergeLocaleCatalog(locale: string, sources: MessageSource[]): MergedLocaleCatalog {
  const result = mergeMessageSources(sources, {
    allowOverridesFromLayer: ['override'],
  });

  return {
    locale,
    messages: result.messages,
    duplicates: result.duplicates,
    sources,
  };
}

export function buildScaffoldLocale(reference: LocaleMessages, translated: LocaleMessages): LocaleMessages {
  return createLocaleScaffold(reference, translated);
}
