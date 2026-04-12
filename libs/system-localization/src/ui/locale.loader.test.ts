import { describe, it, expect } from 'vitest';
import { normalizeLocaleModule, createLocaleLoaders, type LocaleModule } from './locale.loader';

describe('normalizeLocaleModule', () => {
  it('unwraps default export', () => {
    const module: LocaleModule = { default: { 'app.title': 'Hello' } };
    expect(normalizeLocaleModule(module)).toEqual({ 'app.title': 'Hello' });
  });

  it('passes through a plain object without default', () => {
    const module: LocaleModule = { 'app.title': 'Hello' };
    expect(normalizeLocaleModule(module)).toEqual({ 'app.title': 'Hello' });
  });

  it('returns an empty object when input has no messages', () => {
    expect(normalizeLocaleModule({})).toEqual({});
  });
});

describe('createLocaleLoaders', () => {
  it('extracts locale code from file path', async () => {
    const loaders = createLocaleLoaders({
      '/app/locales/en.json': async () => ({ hello: 'Hello' }),
      '/app/locales/fr.json': async () => ({ hello: 'Bonjour' }),
    });

    expect(Object.keys(loaders).sort()).toEqual(['en', 'fr']);
    await expect(loaders.en()).resolves.toEqual({ hello: 'Hello' });
    await expect(loaders.fr()).resolves.toEqual({ hello: 'Bonjour' });
  });

  it('supports locale codes containing dashes', () => {
    const loaders = createLocaleLoaders({
      '/locales/en-GB.json': async () => ({}),
      '/locales/fr-CA.json': async () => ({}),
    });

    expect(Object.keys(loaders).sort()).toEqual(['en-GB', 'fr-CA']);
  });

  it('skips files that do not match the pattern', () => {
    const loaders = createLocaleLoaders({
      '/locales/readme.md': async () => ({} as never),
      '/locales/_meta.yaml': async () => ({} as never),
      '/locales/en.json': async () => ({}),
    });

    expect(Object.keys(loaders)).toEqual(['en']);
  });

  it('returns an empty map when nothing matches', () => {
    const loaders = createLocaleLoaders({});
    expect(loaders).toEqual({});
  });
});
