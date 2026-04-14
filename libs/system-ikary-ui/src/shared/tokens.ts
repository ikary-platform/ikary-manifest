/**
 * IKARY brand constants — no React, browser-safe.
 *
 * Import from `@ikary/system-ikary-ui` (root entry).
 */

/** Core brand hex palette. */
export const BRAND_COLORS = {
  /** Primary CTA blue — used for interactive elements in light mode. */
  blue: '#1d4ed8',
  /** Accent blue — used for links and highlights in dark mode. */
  blueLight: '#78afff',
  /** Deep navy — dark-mode body gradient start. */
  navyDeep: '#060c1a',
  /** Mid navy — body gradient mid stop. */
  navyMid: '#0a1329',
  /** Dark navy — dark-mode body gradient end. */
  navyDark: '#071230',
  /** Near-black text in light mode. */
  inkDark: '#07121e',
} as const;

/** Font family strings ready for `font-family` CSS or inline styles. */
export const BRAND_FONTS = {
  /** Body / UI font. */
  sans: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
  /** Code / monospace font. */
  mono: "'JetBrains Mono', ui-monospace, monospace",
  /** Google Fonts CDN URL for Inter. */
  interUrl:
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  /** Google Fonts CDN URL for JetBrains Mono. */
  jetbrainsMonoUrl:
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap',
} as const;

/** Body background gradients. */
export const BRAND_GRADIENTS = {
  /** Full-viewport light-mode background gradient. */
  bodyLight:
    'linear-gradient(175deg, #ebf2fb 0%, #ddeaf7 30%, #cde0f3 60%, #bfd5ee 100%)',
  /** Full-viewport dark-mode background gradient. */
  bodyDark:
    'linear-gradient(175deg, #060c1a 0%, #080f20 30%, #0a1830 60%, #0d1f3c 100%)',
} as const;
