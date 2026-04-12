import { describe, it, expect } from 'vitest';
import { localizationConfigSchema, defineLocalizationConfig, localizationValidationSchema } from './config.types';

describe('localizationValidationSchema', () => {
  it('applies defaults', () => {
    const result = localizationValidationSchema.parse({});
    expect(result.failOnMissing).toBe(false);
    expect(result.failOnDuplicate).toBe(true);
  });

  it('accepts explicit values', () => {
    const result = localizationValidationSchema.parse({ failOnMissing: true, failOnDuplicate: false });
    expect(result.failOnMissing).toBe(true);
    expect(result.failOnDuplicate).toBe(false);
  });
});

describe('localizationConfigSchema', () => {
  const VALID = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'fr'],
  };

  it('accepts valid config with defaults', () => {
    const result = localizationConfigSchema.safeParse(VALID);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.outputDir).toBe('locales');
    }
  });

  it('rejects when defaultLocale is not in supportedLocales', () => {
    const result = localizationConfigSchema.safeParse({
      defaultLocale: 'de',
      supportedLocales: ['en', 'fr'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate supportedLocales', () => {
    const result = localizationConfigSchema.safeParse({
      defaultLocale: 'en',
      supportedLocales: ['en', 'en'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty supportedLocales', () => {
    const result = localizationConfigSchema.safeParse({
      defaultLocale: 'en',
      supportedLocales: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('defineLocalizationConfig', () => {
  it('returns parsed config', () => {
    const config = defineLocalizationConfig({
      defaultLocale: 'en',
      supportedLocales: ['en', 'fr'],
      outputDir: 'locales',
      validation: { failOnMissing: false, failOnDuplicate: true },
    });
    expect(config.defaultLocale).toBe('en');
    expect(config.supportedLocales).toEqual(['en', 'fr']);
  });
});
