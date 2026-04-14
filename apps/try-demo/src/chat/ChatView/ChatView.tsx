import { useManifestStream } from '../../hooks';
import type { DemoStatus } from '../../stream/demo-api';
import type { StreamState } from '../../stream/stream-state';
import { BlueprintGallery } from '../BlueprintGallery';
import { ChatComposer } from './ChatComposer';
import { ChatIntro } from './ChatIntro';
import { ChatSuggestions } from './ChatSuggestions';
import { ChatTranscript } from './ChatTranscript';

interface Props {
  onStreamStateChange: (state: StreamState) => void;
  demoStatus: DemoStatus;
  onRunLocally?: () => void;
}

/**
 * Chat rail container. Owns only the branching decision (live chat vs
 * blueprint fallback) and the composer placeholder/disabled wiring. All
 * streaming logic lives in `useManifestStream`.
 */
export function ChatView({ onStreamStateChange, demoStatus, onRunLocally }: Props) {
  const { entries, loading, submit, loadBlueprint } = useManifestStream({
    onStreamStateChange,
  });
  const aiOff = !demoStatus.aiAvailable;
  const showIntro = !aiOff && entries.length === 0;

  return (
    <div className="chat-panel">
      {aiOff ? (
        <BlueprintGallery onManifestLoaded={loadBlueprint} onRunLocally={onRunLocally} />
      ) : (
        <>
          {showIntro && <ChatIntro />}
          <ChatTranscript entries={entries} loading={loading} />
          {showIntro && <ChatSuggestions onPick={(p) => void submit(p)} disabled={loading} />}
        </>
      )}
      <ChatComposer
        onSubmit={(p) => void submit(p)}
        disabled={loading || aiOff}
        placeholder={
          aiOff ? 'Live generator paused. Pick a blueprint above.' : 'Describe the app you want…'
        }
      />
    </div>
  );
}
