import type { LocaleMessages } from './message.types';

export interface MessageSource {
  packageName: string;
  locale: string;
  filePath: string;
  layer: 'core' | 'library' | 'app' | 'override';
  messages: LocaleMessages;
}

export interface DuplicateMessage {
  id: string;
  incomingSource: MessageSource;
  existingSource: MessageSource;
}

export interface MergeResult {
  messages: LocaleMessages;
  duplicates: DuplicateMessage[];
  provenance: Record<string, MessageSource>;
}

export interface MergeOptions {
  allowOverridesFromLayer?: MessageSource['layer'][];
}

function sortEntries(messages: LocaleMessages): LocaleMessages {
  return Object.fromEntries(
    Object.entries(messages).sort(([left], [right]) => left.localeCompare(right)),
  ) as LocaleMessages;
}

export function mergeMessageSources(sources: MessageSource[], options: MergeOptions = {}): MergeResult {
  const allowOverrides = new Set(options.allowOverridesFromLayer ?? ['override']);
  const ordered = [...sources].sort((left, right) => {
    const packageOrder = left.packageName.localeCompare(right.packageName);
    if (packageOrder !== 0) {
      return packageOrder;
    }

    const fileOrder = left.filePath.localeCompare(right.filePath);
    if (fileOrder !== 0) {
      return fileOrder;
    }

    return left.layer.localeCompare(right.layer);
  });

  const merged = new Map<string, string>();
  const provenance = new Map<string, MessageSource>();
  const duplicates: DuplicateMessage[] = [];

  for (const source of ordered) {
    const entries = Object.entries(sortEntries(source.messages));
    for (const [id, value] of entries) {
      const existingSource = provenance.get(id);
      if (existingSource && !allowOverrides.has(source.layer)) {
        duplicates.push({
          id,
          incomingSource: source,
          existingSource,
        });
        continue;
      }

      merged.set(id, value);
      provenance.set(id, source);
    }
  }

  return {
    messages: sortEntries(Object.fromEntries(merged.entries()) as LocaleMessages),
    duplicates,
    provenance: Object.fromEntries(provenance.entries()) as Record<string, MessageSource>,
  };
}

export interface LocaleDiffResult {
  missingKeys: string[];
  extraKeys: string[];
}

export function diffLocaleKeys(reference: LocaleMessages, candidate: LocaleMessages): LocaleDiffResult {
  const referenceKeys = new Set(Object.keys(reference));
  const candidateKeys = new Set(Object.keys(candidate));

  const missingKeys = [...referenceKeys].filter((key) => !candidateKeys.has(key)).sort((a, b) => a.localeCompare(b));
  const extraKeys = [...candidateKeys].filter((key) => !referenceKeys.has(key)).sort((a, b) => a.localeCompare(b));

  return {
    missingKeys,
    extraKeys,
  };
}

export function createLocaleScaffold(reference: LocaleMessages, existing: LocaleMessages = {}): LocaleMessages {
  return Object.fromEntries(
    Object.keys(reference)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => [key, existing[key] ?? '']),
  ) as LocaleMessages;
}
