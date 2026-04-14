import { useState } from 'react';
import { AppHeader } from './chrome/AppHeader';
import { IkaryWaveBackground } from '@ikary/system-ikary-ui/ui';
import { RunLocallyPanel } from './chrome/RunLocallyPanel';
import { BrandingPanel } from './chrome/BrandingPanel';
import { ChatView } from './chat/ChatView';
import { PreviewPanel } from './preview/PreviewPanel';
import { useDemoStatus } from './hooks';
import { INITIAL_STREAM_STATE } from './utils';
import type { StreamState } from './stream/stream-state';

/**
 * Root shell. Owns three pieces of state:
 *  - `streamState` - live meta strip + preview data source
 *  - `runLocallyOpen` - slide-panel visibility
 *  - demo status comes from `useDemoStatus` (TanStack Query; no useEffect)
 *
 * Every concrete behavior lives in a child component or a hook.
 */
export function App() {
  const [streamState, setStreamState] = useState<StreamState>(INITIAL_STREAM_STATE);
  const [runLocallyOpen, setRunLocallyOpen] = useState(false);
  const [brandingOpen, setBrandingOpen] = useState(false);
  const demoStatus = useDemoStatus();

  const openRunLocally = () => setRunLocallyOpen(true);
  const closeRunLocally = () => setRunLocallyOpen(false);
  const openBranding = () => setBrandingOpen(true);
  const closeBranding = () => setBrandingOpen(false);

  return (
    <div className="app-shell">
      <IkaryWaveBackground />
      <AppHeader
        streamState={streamState}
        onRunLocally={openRunLocally}
        onOpenBranding={openBranding}
      />
      <div className="app-body">
        <ChatView
          onStreamStateChange={setStreamState}
          demoStatus={demoStatus}
          onRunLocally={openRunLocally}
        />
        <PreviewPanel state={streamState} onRunLocally={openRunLocally} />
      </div>
      {runLocallyOpen && (
        <RunLocallyPanel manifest={streamState.manifest} onClose={closeRunLocally} />
      )}
      {brandingOpen && <BrandingPanel onClose={closeBranding} />}
    </div>
  );
}
