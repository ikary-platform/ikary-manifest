---
"@ikary/system-ikary-ui": minor
"@ikary/cell-primitives": patch
"@ikary/try-demo": patch
"@ikary/cell-playground": patch
---

feat(system-ikary-ui): new shared IKARY brand component library

Introduces `@ikary/system-ikary-ui` — a single package that consolidates all IKARY brand UI elements previously duplicated across `try-demo` and `cell-playground`, and makes them available to any external repo consuming the published npm package.

**Root entry (`@ikary/system-ikary-ui`)** — no React, browser-safe:
- `BRAND_COLORS`, `BRAND_FONTS`, `BRAND_GRADIENTS` — hex / font-family / gradient constants
- `WAVE_SLOW/MID/FAST_PATH` + `_VIEWBOX` — SVG wave path data
- `THEME_PREFLIGHT_SCRIPT` — inline `<script>` string for FOUC prevention

**UI entry (`@ikary/system-ikary-ui/ui`)** — React:
- `IkaryLogo` — self-contained inlined SVG; variants: `full-auto`, `full-black`, `full-white`, `full-original`, `symbol-auto`, `symbol-original`, `symbol-white`; uses `useId()` for gradient ID safety
- `IkaryWaveBackground` — three-layer animated wave background (replaces `OnboardingBackground` in try-demo)
- `ThemeToggle` + `useTheme` — moved from `cell-primitives`

**CSS entry (`@ikary/system-ikary-ui/styles`)**:
- Font `@import` for Inter + JetBrains Mono
- `--ob-*` token block (light + dark)
- Wave `@keyframes` and structural classes
- Logo CSS swap classes (`.ikary-logo-light/dark`)
- `.ikary-nav` glassmorphism rule

**Migrations**:
- `cell-primitives`: `ThemeToggle`/`useTheme` re-exported from new lib (backward-compatible)
- `try-demo`: imports `IkaryWaveBackground` + `IkaryLogo`; duplicated CSS removed
- `cell-playground`: imports `IkaryLogo`; `useDarkMode` replaced by `useTheme`; duplicated CSS removed
