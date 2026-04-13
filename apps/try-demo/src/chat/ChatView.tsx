import { useCallback, useRef, useState } from 'react';
import { streamManifest, type StreamEvent } from '../stream/manifest-stream';
import type { StreamState } from '../stream/stream-state';

const SUGGESTIONS = [
  'Expense tracker for a small team',
  'Reading list with tags and status',
  'Client CRM with deals and contacts',
  'Job board for a recruiting startup',
];

interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatViewProps {
  onStreamStateChange(state: StreamState): void;
}

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

export function ChatView({ onStreamStateChange }: ChatViewProps) {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef<StreamState>(INITIAL_STATE);

  const updateState = useCallback(
    (patch: Partial<StreamState>) => {
      stateRef.current = { ...stateRef.current, ...patch };
      onStreamStateChange(stateRef.current);
    },
    [onStreamStateChange],
  );

  const submit = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || loading) return;
      setLoading(true);
      const userEntry: ChatEntry = { id: crypto.randomUUID(), role: 'user', content: prompt };
      const assistantId = crypto.randomUUID();
      setEntries((prev) => [...prev, userEntry, { id: assistantId, role: 'assistant', content: '' }]);
      stateRef.current = { ...INITIAL_STATE, stage: 'generating' };
      onStreamStateChange(stateRef.current);

      const controller = new AbortController();
      abortRef.current = controller;

      const appendAssistant = (delta: string) => {
        setEntries((prev) =>
          prev.map((e) => (e.id === assistantId ? { ...e, content: e.content + delta } : e)),
        );
      };

      try {
        await streamManifest({
          userPrompt: prompt,
          signal: controller.signal,
          onEvent: (event: StreamEvent) => {
            switch (event.type) {
              case 'chunk':
                appendAssistant(event.delta);
                break;
              case 'partial-manifest':
                updateState({ manifest: event.manifest, stage: 'streaming' });
                break;
              case 'final-manifest':
                updateState({ manifest: event.manifest, stage: 'final' });
                break;
              case 'model-selected':
                updateState({
                  provider: event.provider,
                  model: event.model,
                  attempt: event.attempt,
                  chainLength: event.chainLength,
                });
                break;
              case 'model-fallback':
                updateState({
                  fallbacks: [
                    ...stateRef.current.fallbacks,
                    { fromModel: event.fromModel, nextModel: event.nextModel, reason: event.reason },
                  ],
                });
                appendAssistant(
                  `\n↻ ${event.reason === 'manifest_invalid' ? 'Invalid output' : 'Provider error'} on ${event.fromModel} - falling back to ${event.nextModel}\n`,
                );
                break;
              case 'error':
                appendAssistant(`\n[error:${event.code}] ${event.message}`);
                updateState({ stage: 'error' });
                break;
              case 'done':
                updateState({
                  inputTokens: event.inputTokens,
                  outputTokens: event.outputTokens,
                  stage: stateRef.current.stage === 'error' ? 'error' : 'final',
                });
                break;
              case 'meta':
                break;
            }
          },
        });
      } catch (err) {
        appendAssistant(`\n[stream error] ${(err as Error).message}`);
        updateState({ stage: 'error' });
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading, onStreamStateChange, updateState],
  );

  return (
    <div className="chat-panel">
      {entries.length === 0 && (
        <div className="chat-intro">
          <p>
            <strong>Describe an app.</strong> Watch it build itself as a{' '}
            <a href="https://ikary.co" target="_blank" rel="noreferrer">
              Cell manifest
            </a>
            , rendered live.
          </p>
        </div>
      )}
      <div className="chat-transcript">
        {entries.map((e) => {
          const isLast = e.id === entries[entries.length - 1]?.id;
          const isWaiting = loading && e.role === 'assistant' && isLast && !e.content;
          return (
            <div key={e.id} className="chat-entry">
              <div className="role">{e.role === 'user' ? 'You' : 'Ikary'}</div>
              {isWaiting ? (
                <div className="chat-loading">
                  <span className="chat-loading-dots">
                    <span /> <span /> <span />
                  </span>
                  <span>Thinking…</span>
                </div>
              ) : (
                <div className="content">{e.content || (loading ? '…' : '')}</div>
              )}
            </div>
          );
        })}
      </div>
      {entries.length === 0 && (
        <div className="suggestion-row">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="suggestion-chip"
              onClick={() => void submit(s)}
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        className="chat-composer"
        onSubmit={(ev) => {
          ev.preventDefault();
          const value = input;
          setInput('');
          void submit(value);
        }}
      >
        <textarea
          className="ob-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the app you want…"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const value = input;
              setInput('');
              void submit(value);
            }
          }}
        />
        <button type="submit" className="ob-btn-continue" disabled={loading || !input.trim()}>
          {loading ? '…' : 'Build'}
        </button>
      </form>
    </div>
  );
}
