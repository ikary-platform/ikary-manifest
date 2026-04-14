import { useMemo } from 'react';
import { CellAppRenderer } from '@ikary/cell-renderer';
import { parseManifest, type CellManifestV1 } from '@ikary/cell-contract';

interface Props {
  /** Raw (possibly partial) manifest from the stream. Validated on every render. */
  manifest: unknown;
}

/**
 * White card wrapping the rendered Cell app. Validates the incoming manifest
 * on each render and falls back to an "Assembling..." placeholder when the
 * partial-JSON isn't a valid CellManifestV1 yet.
 *
 * The mount-triggered CSS animation lives in styles.css (`.preview-card`
 * keyframes). Callers MUST key this component on the manifest identity
 * (for example `metadata.key`) so a fresh manifest replays the fade-in
 * without any JS-side delay.
 */
export function ManifestPreviewCard({ manifest }: Props) {
  const valid = useMemo<CellManifestV1 | null>(() => {
    if (!manifest) return null;
    const result = parseManifest(manifest);
    return result.valid && result.manifest ? result.manifest : null;
  }, [manifest]);

  if (!valid) {
    return (
      <div className="preview-floating">
        <div className="preview-floating-spinner" />
        <div className="preview-floating-title">Assembling manifest…</div>
      </div>
    );
  }

  return (
    <div className="preview-card">
      <CellAppRenderer manifest={valid} dataMode="mock" />
    </div>
  );
}
