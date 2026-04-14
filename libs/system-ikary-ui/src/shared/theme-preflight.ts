/**
 * Inline `<script>` string for FOUC prevention.
 *
 * Drop this into the `<head>` of any SSR/static HTML page so the stored
 * theme is pre-applied before React hydrates. Defined here (not in the
 * React hook file) so it can be imported from the browser-safe root entry
 * without pulling in any React dependency.
 */
export const THEME_PREFLIGHT_SCRIPT = `(() => {
  try {
    var s = localStorage.getItem('ikary-theme');
    var m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (s === 'dark' || (!s && m)) document.documentElement.classList.add('dark');
  } catch (_) {}
})();`;
