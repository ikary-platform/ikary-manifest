import { useEffect } from 'react';
import type { Monaco } from '@monaco-editor/react';

/** Resolves the Monaco theme name from the current dark-mode state. */
export function getTheme() {
  return document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs';
}

/** Syncs the Monaco editor theme whenever the <html> dark class changes. */
export function useMonacoTheme(monaco: Monaco | null) {
  useEffect(() => {
    if (!monaco) return;
    monaco.editor.setTheme(getTheme());

    const observer = new MutationObserver(() => {
      monaco.editor.setTheme(getTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [monaco]);
}
