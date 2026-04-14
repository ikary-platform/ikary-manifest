import { useState, useEffect } from 'react';

// Read initial state from the class already applied by the inline <script> in
// index.html — avoids a flash of wrong theme on first render.
export function useDarkMode() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('ikary-theme', dark ? 'dark' : 'light');
    } catch (_) {}
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
