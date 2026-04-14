import { useMemo } from 'react';
import type { StreamState } from '../../stream/stream-state';
import { ManifestPreviewCard } from './ManifestPreviewCard';
import { PreviewDisclaimer } from './PreviewDisclaimer';
import { PreviewEmpty } from './PreviewEmpty';
import { PreviewLoading } from './PreviewLoading';

interface Props {
  state: StreamState;
  onRunLocally: () => void;
}

function readManifestKey(manifest: unknown): string | null {
  if (!manifest || typeof manifest !== 'object') return null;
  const meta = (manifest as { metadata?: { key?: unknown } }).metadata;
  return meta && typeof meta.key === 'string' ? meta.key : null;
}

/**
 * Right-hand side of the split layout. Renders disclaimer + content in the
 * order: idle → loading → valid manifest card. The card is keyed on the
 * manifest identity so each new manifest replays the CSS fade-in.
 */
export function PreviewPanel({ state, onRunLocally }: Props) {
  const cardKey = useMemo(() => readManifestKey(state.manifest), [state.manifest]);

  return (
    <div className="preview-panel">
      {state.manifest != null && <PreviewDisclaimer onRunLocally={onRunLocally} />}
      {state.stage === 'idle' && <PreviewEmpty />}
      {(state.stage === 'generating' || state.stage === 'streaming') && !state.manifest && (
        <PreviewLoading stage={state.stage} model={state.model} />
      )}
      {state.manifest != null && (
        <ManifestPreviewCard key={cardKey ?? 'preview'} manifest={state.manifest} />
      )}
    </div>
  );
}
