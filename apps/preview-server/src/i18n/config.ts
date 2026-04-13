/**
 * Preview server localization configuration.
 *
 * Each locale loader:
 *   1. Starts from the renderer's built-in English defaults (so everything
 *      renders sensibly even without a cell catalog).
 *   2. Fetches the cell's compiled `locales/<locale>.json` bundle from the
 *      preview server's locales endpoint (see vite.config.ts).
 *   3. Merges the two — cell catalog wins per-key, so `ikary localize build`
 *      output (including overrides) takes effect on the next reload.
 */
import { defineLocalizationConfig } from '@ikary/system-localization';
import type { LocaleMessages } from '@ikary/system-localization';
import { rendererEnMessages } from '@ikary/renderer';

export const config = defineLocalizationConfig({
  defaultLocale: 'en',
  supportedLocales: ['en'],
  outputDir: 'locales',
  validation: {
    failOnMissing: false,
    failOnDuplicate: true,
  },
});

async function fetchCellCatalog(locale: string): Promise<LocaleMessages> {
  try {
    const response = await fetch(`/locales/${locale}.json`);
    if (!response.ok) return {};
    const data = (await response.json()) as Record<string, unknown>;
    const normalized: LocaleMessages = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') normalized[key] = value;
    }
    return normalized;
  } catch {
    return {};
  }
}

export const loaders = {
  en: async (): Promise<LocaleMessages> => {
    const cellCatalog = await fetchCellCatalog('en');
    // Cell catalog wins per-key so `ikary localize build` output replaces
    // renderer defaults.
    return { ...rendererEnMessages, ...cellCatalog };
  },
} as const;
