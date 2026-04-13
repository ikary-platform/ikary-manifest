import { useEffect, useMemo, useState } from 'react';
import { CellAppRenderer } from '@ikary/cell-renderer';
import { parseManifest } from '@ikary/cell-contract';
import type { StreamState } from '../stream/stream-state';

interface Props {
  state: StreamState;
}

export function StreamingManifestPreview({ state }: Props) {
  const valid = useMemo(() => {
    if (!state.manifest) return null;
    const res = parseManifest(state.manifest);
    return res.valid && res.manifest ? res.manifest : null;
  }, [state.manifest]);

  // Tiny delay before mounting the card so the fade-in animation actually fires.
  const [showCard, setShowCard] = useState(false);
  useEffect(() => {
    if (valid) {
      const t = window.setTimeout(() => setShowCard(true), 16);
      return () => window.clearTimeout(t);
    }
    setShowCard(false);
    return undefined;
  }, [valid]);

  if (!valid) {
    return <FloatingStatus state={state} />;
  }

  return (
    <div className={`preview-card preview-card-enter ${showCard ? 'is-shown' : ''}`}>
      <CellAppRenderer manifest={valid} dataMode="mock" />
    </div>
  );
}

function FloatingStatus({ state }: { state: StreamState }) {
  if (state.stage === 'idle') {
    return (
      <div className="preview-floating">
        <div className="preview-floating-title">Your generated app will appear here</div>
        <div className="preview-floating-sub">Describe an app on the left to start.</div>
      </div>
    );
  }
  return (
    <div className="preview-floating">
      <div className="preview-floating-spinner" />
      <div className="preview-floating-title">
        {state.stage === 'generating' ? 'Generating your app…' : 'Assembling manifest…'}
      </div>
      {state.model && (
        <div className="preview-floating-sub">{state.model}</div>
      )}
    </div>
  );
}
