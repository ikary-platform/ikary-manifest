import { useMutation, useQuery } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { OpenAiResponsesClient } from '../../features/studio/openai-responses.client';
import type {
  StudioDebugTraceEvent,
  StudioLlmExchangeRecord,
  StudioOrchestrationResult,
} from '../../features/studio/contracts';

const STUDIO_STATE_QUERY_KEY = ['studio', 'state'] as const;

interface UseStudioSendTurnOptions {
  runUserTurn: (
    text: string,
    setStatusWord: (word: string | null) => void,
    appendTrace: (trace: StudioDebugTraceEvent) => void,
    appendLlmExchange: (exchange: StudioLlmExchangeRecord) => void,
  ) => Promise<StudioOrchestrationResult>;
  setStatusWord: (word: string | null) => void;
  appendTrace: (trace: StudioDebugTraceEvent) => void;
  appendLlmExchange: (exchange: StudioLlmExchangeRecord) => void;
  traceUi: (stage: string, message: string, level?: StudioDebugTraceEvent['level'], details?: unknown) => void;
  setLastRunResult: (result: StudioOrchestrationResult | null) => void;
  setLatestError: (error: string | null) => void;
  refreshStudioState: () => void;
}

interface UseStudioGenerateOptions extends Omit<UseStudioSendTurnOptions, 'runUserTurn'> {
  generateInitial: (
    setStatusWord: (word: string | null) => void,
    appendTrace: (trace: StudioDebugTraceEvent) => void,
    appendLlmExchange: (exchange: StudioLlmExchangeRecord) => void,
  ) => Promise<StudioOrchestrationResult>;
}

export function useStudioModelCatalog(openAiClient: OpenAiResponsesClient) {
  return useQuery({
    queryKey: ['studio', 'model-catalog'],
    queryFn: async () => openAiClient.listModels(),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: openAiClient.isConfigured(),
  });
}

export function useStudioState<TState>(loadState: () => TState) {
  const studioStateQuery = useQuery<TState>({
    queryKey: STUDIO_STATE_QUERY_KEY,
    queryFn: async () => loadState(),
  });

  return {
    studioStateQuery,
    state: studioStateQuery.data ?? loadState(),
  };
}

export function refreshStudioState<TState>(queryClient: QueryClient, loadState: () => TState) {
  queryClient.setQueryData(STUDIO_STATE_QUERY_KEY, loadState());
}

export function useStudioSendTurn({
  runUserTurn,
  setStatusWord,
  appendTrace,
  appendLlmExchange,
  traceUi,
  setLastRunResult,
  setLatestError,
  refreshStudioState,
}: UseStudioSendTurnOptions) {
  return useMutation({
    mutationFn: async (text: string) => {
      traceUi('chat.send', 'Submitting user message to orchestrator.', 'info', { chars: text.length });
      return runUserTurn(text, setStatusWord, appendTrace, appendLlmExchange);
    },
    onSuccess: (result) => {
      setLastRunResult(result);
      setStatusWord(result.statusWord);
      setLatestError(result.validationError);
      traceUi('chat.send.success', 'User turn completed.', 'info', {
        phase: result.phase,
        retriesUsed: result.retriesUsed,
        hasValidationError: Boolean(result.validationError),
      });
      refreshStudioState();
    },
    onError: (error) => {
      setLatestError(error instanceof Error ? error.message : 'Failed to process Studio message.');
      traceUi('chat.send.error', error instanceof Error ? error.message : 'Failed to process Studio message.', 'error');
      refreshStudioState();
    },
  });
}

export function useStudioGenerateInitial({
  generateInitial,
  setStatusWord,
  appendTrace,
  appendLlmExchange,
  traceUi,
  setLastRunResult,
  setLatestError,
  refreshStudioState,
}: UseStudioGenerateOptions) {
  return useMutation({
    mutationFn: async () => {
      traceUi('generate.start', 'Submitting phase 3 generation request.');
      return generateInitial(setStatusWord, appendTrace, appendLlmExchange);
    },
    onSuccess: (result) => {
      setLastRunResult(result);
      setStatusWord(result.statusWord);
      setLatestError(result.validationError);
      traceUi('generate.success', 'Generation request completed.', 'info', {
        phase: result.phase,
        retriesUsed: result.retriesUsed,
        hasValidationError: Boolean(result.validationError),
      });
      refreshStudioState();
    },
    onError: (error) => {
      setLatestError(error instanceof Error ? error.message : 'Failed to generate initial Cell.');
      traceUi('generate.error', error instanceof Error ? error.message : 'Failed to generate initial Cell.', 'error');
      refreshStudioState();
    },
  });
}
