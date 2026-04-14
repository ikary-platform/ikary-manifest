import { afterEach, describe, expect, it } from 'vitest';
import { applyTheme, hexToHslTriplet } from './applyTheme.js';

describe('applyTheme', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
    document.head.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach((n) => n.remove());
    document.head.querySelectorAll('style#ikary-cell-branding-fonts').forEach((n) => n.remove());
  });

  it('leaves CSS variables unset when theme is null', () => {
    applyTheme(null);
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--accent-color')).toBe('');
    expect(style.getPropertyValue('--font-title')).toBe('');
    expect(style.getPropertyValue('--font-body')).toBe('');
  });

  it('writes accent-color and foreground when accent is set', () => {
    applyTheme({
      accentColor: '#FFFFFF',
      titleFontFamily: null,
      bodyFontFamily: null,
      defaultThemeMode: null,
      isCustomized: true,
    });
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--accent-color')).toBe('#FFFFFF');
    expect(style.getPropertyValue('--accent-foreground')).toBe('#000000');
  });

  it('clears accent vars when accent becomes null after being set', () => {
    applyTheme({
      accentColor: '#2563EB',
      titleFontFamily: null,
      bodyFontFamily: null,
      defaultThemeMode: null,
      isCustomized: true,
    });
    applyTheme({
      accentColor: null,
      titleFontFamily: null,
      bodyFontFamily: null,
      defaultThemeMode: null,
      isCustomized: false,
    });
    expect(document.documentElement.style.getPropertyValue('--accent-color')).toBe('');
  });

  it('writes font variables and loads google font for non-generic family', () => {
    applyTheme({
      accentColor: null,
      titleFontFamily: '"Roboto", sans-serif',
      bodyFontFamily: 'sans-serif',
      defaultThemeMode: null,
      isCustomized: true,
    });
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--font-title')).toContain('Roboto');
    expect(style.getPropertyValue('--font-body')).toBe('sans-serif');
    const link = document.head.querySelector('link[href*="Roboto"]');
    expect(link).not.toBeNull();
  });

  it('overrides shadcn --primary and --ring with the accent in HSL', () => {
    applyTheme({
      accentColor: '#16A34A',
      titleFontFamily: null,
      bodyFontFamily: null,
      defaultThemeMode: null,
      isCustomized: true,
    });
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--primary')).toBe('142 76% 36%');
    expect(style.getPropertyValue('--ring')).toBe('142 76% 36%');
    expect(style.getPropertyValue('--primary-foreground')).toBe('0 0% 100%');
  });

  it('clears shadcn overrides when accent is removed', () => {
    applyTheme({
      accentColor: '#16A34A',
      titleFontFamily: null,
      bodyFontFamily: null,
      defaultThemeMode: null,
      isCustomized: true,
    });
    applyTheme({
      accentColor: null,
      titleFontFamily: null,
      bodyFontFamily: null,
      defaultThemeMode: null,
      isCustomized: false,
    });
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--primary')).toBe('');
    expect(style.getPropertyValue('--ring')).toBe('');
    expect(style.getPropertyValue('--primary-foreground')).toBe('');
  });

  it('injects a font style tag for body and headings', () => {
    applyTheme({
      accentColor: null,
      titleFontFamily: '"Merriweather", serif',
      bodyFontFamily: '"Roboto", sans-serif',
      defaultThemeMode: null,
      isCustomized: true,
    });
    const tag = document.head.querySelector(
      'style#ikary-cell-branding-fonts',
    ) as HTMLStyleElement | null;
    expect(tag).not.toBeNull();
    expect(tag?.textContent).toContain('body');
    expect(tag?.textContent).toContain('var(--font-body)');
    expect(tag?.textContent).toContain('h1, h2, h3, h4, h5, h6');
    expect(tag?.textContent).toContain('var(--font-title)');
  });

  it('removes the font style tag when both fonts are unset', () => {
    applyTheme({
      accentColor: null,
      titleFontFamily: '"Merriweather", serif',
      bodyFontFamily: null,
      defaultThemeMode: null,
      isCustomized: true,
    });
    expect(document.head.querySelector('style#ikary-cell-branding-fonts')).not.toBeNull();
    applyTheme({
      accentColor: null,
      titleFontFamily: null,
      bodyFontFamily: null,
      defaultThemeMode: null,
      isCustomized: false,
    });
    expect(document.head.querySelector('style#ikary-cell-branding-fonts')).toBeNull();
  });
});

describe('hexToHslTriplet', () => {
  it('converts pure red', () => {
    expect(hexToHslTriplet('#FF0000')).toBe('0 100% 50%');
  });
  it('converts pure white', () => {
    expect(hexToHslTriplet('#FFFFFF')).toBe('0 0% 100%');
  });
  it('converts pure black', () => {
    expect(hexToHslTriplet('#000000')).toBe('0 0% 0%');
  });
  it('returns null for invalid hex', () => {
    expect(hexToHslTriplet('not-a-color')).toBeNull();
  });
});

