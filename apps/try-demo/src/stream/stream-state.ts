export interface ModelFallback {
  fromModel: string;
  nextModel: string;
  reason: 'manifest_invalid' | 'provider_error';
}

export interface StreamState {
  manifest: unknown | null;
  stage: 'idle' | 'generating' | 'streaming' | 'final' | 'error';
  provider: string | null;
  model: string | null;
  attempt: number;
  chainLength: number;
  fallbacks: ModelFallback[];
  inputTokens: number;
  outputTokens: number;
}
