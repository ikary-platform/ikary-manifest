/**
 * Preview server localization configuration.
 *
 * The preview ships English-only by default. End-user cells can override any
 * renderer key by dropping a key into their own `src/locales/overrides/en.ts`
 * and running `ikary localize build` (see docs/guide/localization.md).
 */
import { defineLocalizationConfig } from '@ikary/system-localization';
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

/**
 * Async loaders for each supported locale.
 *
 * For `en` we merge the renderer's built-in defaults with any compiled
 * catalog shipped with the cell. If the cell doesn't ship a catalog, the
 * renderer defaults still apply so all UI renders in English.
 */
export const loaders = {
  en: async () => ({ ...rendererEnMessages }),
} as const;
