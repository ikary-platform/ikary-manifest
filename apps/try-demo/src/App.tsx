import { useState } from 'react';
import { ThemeToggle } from '@ikary/cell-primitives';
import { ChatView } from './chat/ChatView';
import { StreamingManifestPreview } from './render/StreamingManifestPreview';
import { OnboardingBackground } from './chrome/OnboardingBackground';
import { HeaderMeta } from './chrome/HeaderMeta';
import { RunLocallyPanel } from './chrome/RunLocallyPanel';
import type { StreamState } from './stream/stream-state';

const INITIAL_STATE: StreamState = {
  manifest: null,
  stage: 'idle',
  provider: null,
  model: null,
  attempt: 0,
  chainLength: 0,
  fallbacks: [],
  inputTokens: 0,
  outputTokens: 0,
};

export function App() {
  const [streamState, setStreamState] = useState<StreamState>(INITIAL_STATE);
  const [runLocallyOpen, setRunLocallyOpen] = useState(false);

  return (
    <div className="app-shell">
      <OnboardingBackground />
      <header className="app-header">
        <div className="app-header-left">
          <a className="app-title" href="https://ikary.co" target="_blank" rel="noreferrer" aria-label="Ikary">
            <img className="app-logo app-logo-light" src="/brand/black-full.svg" alt="Ikary" />
            <img className="app-logo app-logo-dark" src="/brand/white-full.svg" alt="Ikary" />
            <span className="app-title-subdomain">try</span>
          </a>
          <HeaderMeta state={streamState} />
        </div>
        <div className="app-header-right">
          <button
            className="header-link"
            onClick={() => setRunLocallyOpen(true)}
            disabled={!streamState.manifest}
            style={{ cursor: streamState.manifest ? 'pointer' : 'not-allowed', opacity: streamState.manifest ? 1 : 0.5 }}
          >
            ⬇ Run locally
          </button>
          <a className="header-link" href="https://github.com/ikary-platform/ikary-manifest" target="_blank" rel="noreferrer">
            ⭐ GitHub
          </a>
          <a className="header-link header-link-accent" href="https://ikary.co" target="_blank" rel="noreferrer">
            ikary.co →
          </a>
          <ThemeToggle />
        </div>
      </header>
      <div className="app-body">
        <ChatView onStreamStateChange={setStreamState} />
        <div className="preview-panel">
          <StreamingManifestPreview state={streamState} />
        </div>
      </div>
      {runLocallyOpen && (
        <RunLocallyPanel manifest={streamState.manifest} onClose={() => setRunLocallyOpen(false)} />
      )}
    </div>
  );
}
