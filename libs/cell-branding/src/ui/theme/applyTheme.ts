import type { ThemeState } from './types.js';

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseHexColor(hex: string): RgbColor | null {
  const normalized = hex.trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(normalized)) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

function luminanceChannel(value: number): number {
  const normalized = clamp(value, 0, 255) / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getReadableForeground(hex: string): string {
  const rgb = parseHexColor(hex);
  if (!rgb) return '#FFFFFF';
  const luminance =
    0.2126 * luminanceChannel(rgb.r) +
    0.7152 * luminanceChannel(rgb.g) +
    0.0722 * luminanceChannel(rgb.b);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

function toRgba(hex: string, alpha: number): string {
  const rgb = parseHexColor(hex);
  if (!rgb) return `rgba(120, 170, 255, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1)})`;
}

// Convert hex (#RRGGBB) to the space-separated HSL triplet that shadcn/Tailwind
// css variables expect, e.g. "240 100% 50%".
export function hexToHslTriplet(hex: string): string | null {
  const rgb = parseHexColor(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const GENERIC_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
]);
const SELF_HOSTED_FAMILIES = new Set(['Inter', 'IBM Plex Sans']);
const loadedFonts = new Set<string>();

function extractPrimaryFamily(fontStack: string): string | null {
  const first = fontStack.split(',')[0]?.trim().replace(/^["']|["']$/g, '');
  if (!first) return null;
  if (GENERIC_FAMILIES.has(first.toLowerCase())) return null;
  if (SELF_HOSTED_FAMILIES.has(first)) return null;
  return first;
}

function loadGoogleFont(family: string): void {
  if (typeof document === 'undefined') return;
  if (loadedFonts.has(family)) return;
  loadedFonts.add(family);

  const encoded = encodeURIComponent(family);
  const href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap`;
  if (document.querySelector(`link[href="${href}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

const FONT_STYLE_TAG_ID = 'ikary-cell-branding-fonts';

// Inject (or remove) a managed <style> tag that overrides body and heading
// font-family. Tailwind's font-sans utility is set on body by default, so
// only overriding the body element propagates the new family to descendants.
function applyFontStyleTag(titleFont: string | null, bodyFont: string | null): void {
  if (typeof document === 'undefined') return;
  const head = document.head;
  let tag = head.querySelector(`style#${FONT_STYLE_TAG_ID}`) as HTMLStyleElement | null;

  if (!titleFont && !bodyFont) {
    tag?.remove();
    return;
  }

  if (!tag) {
    tag = document.createElement('style');
    tag.id = FONT_STYLE_TAG_ID;
    head.appendChild(tag);
  }

  const rules: string[] = [];
  if (bodyFont) {
    rules.push(`body { font-family: var(--font-body) !important; }`);
  }
  if (titleFont) {
    rules.push(
      `h1, h2, h3, h4, h5, h6 { font-family: var(--font-title) !important; }`,
    );
  }
  tag.textContent = rules.join('\n');
}

const CSS_VARS = {
  accent: '--accent-color',
  accentForeground: '--accent-foreground',
  titleFont: '--font-title',
  bodyFont: '--font-body',
  // shadcn HSL triplets — set so that `bg-primary`, `text-primary-foreground`,
  // `ring`, etc. follow the user's accent color.
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  ring: '--ring',
  // Custom CTA gradient tokens used by ikary product surfaces.
  ctaBgStart: '--ux-cta-bg-start',
  ctaBgEnd: '--ux-cta-bg-end',
  ctaBgHoverStart: '--ux-cta-bg-hover-start',
  ctaBgHoverEnd: '--ux-cta-bg-hover-end',
  ctaFg: '--ux-cta-fg',
  ctaBorder: '--ux-cta-border',
  ctaBorderHover: '--ux-cta-border-hover',
  ctaFocusRing: '--ux-cta-focus-ring',
} as const;

function clearVars(root: HTMLElement, vars: readonly string[]): void {
  for (const name of vars) root.style.removeProperty(name);
}

function setVar(root: HTMLElement, name: string, value: string | null): void {
  if (value === null) {
    root.style.removeProperty(name);
  } else {
    root.style.setProperty(name, value);
  }
}

export function applyTheme(theme: ThemeState | null | undefined): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const accent = theme?.accentColor ?? null;
  if (accent && /^#[0-9A-Fa-f]{6}$/.test(accent)) {
    const fg = getReadableForeground(accent);
    const accentHsl = hexToHslTriplet(accent);
    const fgHsl = hexToHslTriplet(fg);

    setVar(root, CSS_VARS.accent, accent);
    setVar(root, CSS_VARS.accentForeground, fg);

    if (accentHsl) {
      setVar(root, CSS_VARS.primary, accentHsl);
      setVar(root, CSS_VARS.ring, accentHsl);
    }
    if (fgHsl) setVar(root, CSS_VARS.primaryForeground, fgHsl);

    setVar(root, CSS_VARS.ctaBgStart, accent);
    setVar(root, CSS_VARS.ctaBgEnd, accent);
    setVar(root, CSS_VARS.ctaBgHoverStart, accent);
    setVar(root, CSS_VARS.ctaBgHoverEnd, accent);
    setVar(root, CSS_VARS.ctaFg, fg);
    setVar(root, CSS_VARS.ctaBorder, toRgba(accent, 0.22));
    setVar(root, CSS_VARS.ctaBorderHover, toRgba(accent, 0.35));
    setVar(root, CSS_VARS.ctaFocusRing, toRgba(accent, 0.35));
  } else {
    clearVars(root, [
      CSS_VARS.accent,
      CSS_VARS.accentForeground,
      CSS_VARS.primary,
      CSS_VARS.primaryForeground,
      CSS_VARS.ring,
      CSS_VARS.ctaBgStart,
      CSS_VARS.ctaBgEnd,
      CSS_VARS.ctaBgHoverStart,
      CSS_VARS.ctaBgHoverEnd,
      CSS_VARS.ctaFg,
      CSS_VARS.ctaBorder,
      CSS_VARS.ctaBorderHover,
      CSS_VARS.ctaFocusRing,
    ]);
  }

  const titleFont = theme?.titleFontFamily?.trim() || null;
  setVar(root, CSS_VARS.titleFont, titleFont);
  if (titleFont) {
    const family = extractPrimaryFamily(titleFont);
    if (family) loadGoogleFont(family);
  }

  const bodyFont = theme?.bodyFontFamily?.trim() || null;
  setVar(root, CSS_VARS.bodyFont, bodyFont);
  if (bodyFont) {
    const family = extractPrimaryFamily(bodyFont);
    if (family) loadGoogleFont(family);
  }

  applyFontStyleTag(titleFont, bodyFont);
}
