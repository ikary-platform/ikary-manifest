import { useCallback } from 'react';

export interface UseManifestDownloadReturn {
  download: (manifest: unknown, filename: string) => void;
}

/**
 * One-shot JSON download trigger. Pulled out of RunLocallyPanel so that
 * component stays presentational and any future callers (share link copy
 * button, CLI paste helper) reuse the same Blob plumbing.
 */
export function useManifestDownload(): UseManifestDownloadReturn {
  const download = useCallback((manifest: unknown, filename: string) => {
    if (!manifest) return;
    const text = JSON.stringify(manifest, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);
  return { download };
}
