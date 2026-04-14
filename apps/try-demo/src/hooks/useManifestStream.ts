import { useCallback, useRef, useState } from 'react';
import { streamManifest, type StreamEvent } from '../stream/manifest-stream';
import type { StreamState } from '../stream/stream-state';
import { INITIAL_STREAM_STATE } from '../utils/initial-stream-state';

export interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface UseManifestStreamArgs {
  /** Fires on every state transition. Parent renders headers / preview from this. */
  onStreamStateChange: (state: StreamState) => void;
}

export interface UseManifestStreamReturn {
  entries: ChatEntry[];
  loading: boolean;
  submit: (prompt: string) => Promise<void>;
  /** Load a preselected blueprint manifest without calling the LLM. */
  loadBlueprint: (blueprintId: string, manifest: unknown) => void;
  /** Reset entries + external state to the initial snapshot. */
  reset: () => void;
}

/**
 * Owns the entire client-side streaming pipeline:
 *  - user + assistant chat entries
 *  - provider stream ingestion (chunks, partial/final manifests, fallbacks, errors)
 *  - abort plumbing on unmount / new submit
 *  - external state dispatch via `onStreamStateChange`
 *
 * Components consume the returned callbacks and render from them. No
 * `useEffect` is used; lifecycle concerns are captured in refs.
 */
export function useManifestStream({ onStreamStateChange }: UseManifestStreamArgs): UseManifestStreamReturn {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef<StreamState>(INITIAL_STREAM_STATE);

  const patchState = useCallback(
    (patch: Partial<StreamState>) => {
      stateRef.current = { ...stateRef.current, ...patch };
      onStreamStateChange(stateRef.current);
    },
    [onStreamStateChange],
  );

  const appendAssistant = useCallback((assistantId: string, delta: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === assistantId ? { ...e, content: e.content + delta } : e)),
    );
  }, []);

  const handleEvent = useCallback(
    (assistantId: string, event: StreamEvent) => {
      switch (event.type) {
        case 'chunk':
          appendAssistant(assistantId, event.delta);
          break;
        case 'partial-manifest':
          patchState({ manifest: event.manifest, stage: 'streaming' });
          break;
        case 'final-manifest':
          patchState({ manifest: event.manifest, stage: 'final' });
          break;
        case 'model-selected':
          patchState({
            provider: event.provider,
            model: event.model,
            attempt: event.attempt,
            chainLength: event.chainLength,
          });
          break;
        case 'model-fallback':
          patchState({
            fallbacks: [
              ...stateRef.current.fallbacks,
              { fromModel: event.fromModel, nextModel: event.nextModel, reason: event.reason },
            ],
          });
          appendAssistant(
            assistantId,
            `\n↻ ${event.reason === 'manifest_invalid' ? 'Invalid output' : 'Provider error'} on ${event.fromModel} - falling back to ${event.nextModel}\n`,
          );
          break;
        case 'error':
          appendAssistant(assistantId, `\n[error:${event.code}] ${event.message}`);
          patchState({ stage: 'error' });
          break;
        case 'done':
          patchState({
            inputTokens: event.inputTokens,
            outputTokens: event.outputTokens,
            stage: stateRef.current.stage === 'error' ? 'error' : 'final',
          });
          break;
        case 'meta':
          break;
      }
    },
    [appendAssistant, patchState],
  );

  const submit = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || loading) return;
      setLoading(true);

      const userEntry: ChatEntry = { id: crypto.randomUUID(), role: 'user', content: prompt };
      const assistantId = crypto.randomUUID();
      setEntries((prev) => [...prev, userEntry, { id: assistantId, role: 'assistant', content: '' }]);

      stateRef.current = { ...INITIAL_STREAM_STATE, stage: 'generating' };
      onStreamStateChange(stateRef.current);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamManifest({
          userPrompt: prompt,
          signal: controller.signal,
          onEvent: (event) => handleEvent(assistantId, event),
        });
      } catch (err) {
        appendAssistant(assistantId, `\n[stream error] ${(err as Error).message}`);
        patchState({ stage: 'error' });
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading, onStreamStateChange, handleEvent, appendAssistant, patchState],
  );

  const loadBlueprint = useCallback(
    (blueprintId: string, manifest: unknown) => {
      stateRef.current = {
        ...INITIAL_STREAM_STATE,
        manifest,
        stage: 'final',
        provider: 'blueprint',
        model: `blueprint/${blueprintId}`,
        attempt: 1,
        chainLength: 1,
      };
      onStreamStateChange(stateRef.current);
      setEntries([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Loaded blueprint: ${blueprintId}\n\nThis is a pre-built manifest from our examples library.`,
        },
      ]);
    },
    [onStreamStateChange],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setEntries([]);
    setLoading(false);
    stateRef.current = INITIAL_STREAM_STATE;
    onStreamStateChange(INITIAL_STREAM_STATE);
  }, [onStreamStateChange]);

  return { entries, loading, submit, loadBlueprint, reset };
}
