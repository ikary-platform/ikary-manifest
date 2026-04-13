import type {
  StudioArtifactRecord,
  StudioCurrentArtifactSet,
  StudioDebugTraceEvent,
  StudioLlmExchangeRecord,
  StudioMessageRecord,
  StudioOrchestrationResult,
  StudioPreviewModel,
  StudioSessionRecord,
} from './contracts';

export interface StudioBundleV1 {
  version: 'studio-bundle-v1';
  exported_at: string;
  session: StudioSessionRecord | null;
  messages: StudioMessageRecord[];
  artifacts: StudioArtifactRecord[];
  current_artifacts: Record<string, unknown>;
}

export interface StudioDebugBundleV1 {
  version: 'studio-debug-bundle-v1';
  exported_at: string;
  environment: {
    user_agent: string;
    url: string;
    selected_model: string;
    env_default_model: string;
    has_openai_api_key: boolean;
  };
  state: {
    session: StudioSessionRecord | null;
    messages: StudioMessageRecord[];
    artifacts: StudioArtifactRecord[];
    current_artifacts: StudioCurrentArtifactSet;
  };
  runtime: {
    debug_mode: boolean;
    status_word: string | null;
    latest_error: string | null;
    last_run_result: StudioOrchestrationResult | null;
    debug_traces: StudioDebugTraceEvent[];
    llm_exchanges: StudioLlmExchangeRecord[];
  };
  preview: {
    manifest_summary: StudioPreviewModel['manifestSummary'];
    entity_summary: StudioPreviewModel['entitySummary'];
    compile_errors: StudioPreviewModel['compileErrors'];
  };
}

export function buildStudioBundle(input: {
  session: StudioSessionRecord | null;
  messages: StudioMessageRecord[];
  artifacts: StudioArtifactRecord[];
}): StudioBundleV1 {
  const currentArtifacts: Record<string, unknown> = {};

  for (const artifact of input.artifacts.filter((entry) => entry.is_current)) {
    currentArtifacts[artifact.artifact_type] = artifact.json_payload;
  }

  return {
    version: 'studio-bundle-v1',
    exported_at: new Date().toISOString(),
    session: input.session,
    messages: input.messages,
    artifacts: input.artifacts,
    current_artifacts: currentArtifacts,
  };
}

export function buildStudioDebugBundle(input: {
  session: StudioSessionRecord | null;
  messages: StudioMessageRecord[];
  artifacts: StudioArtifactRecord[];
  currentArtifacts: StudioCurrentArtifactSet;
  preview: StudioPreviewModel;
  debugMode: boolean;
  statusWord: string | null;
  latestError: string | null;
  lastRunResult: StudioOrchestrationResult | null;
  selectedModel: string;
  debugTraces: StudioDebugTraceEvent[];
  llmExchanges: StudioLlmExchangeRecord[];
}): StudioDebugBundleV1 {
  const envDefaultModel =
    typeof import.meta !== 'undefined'
      ? ((import.meta.env.VITE_STUDIO_MODEL as string | undefined) ?? 'gpt-4o-mini')
      : 'gpt-4o-mini';
  const envApiKey =
    typeof import.meta !== 'undefined' ? (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) : undefined;

  return {
    version: 'studio-debug-bundle-v1',
    exported_at: new Date().toISOString(),
    environment: {
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      selected_model: input.selectedModel,
      env_default_model: envDefaultModel,
      has_openai_api_key: Boolean(envApiKey),
    },
    state: {
      session: input.session,
      messages: input.messages,
      artifacts: input.artifacts,
      current_artifacts: input.currentArtifacts,
    },
    runtime: {
      debug_mode: input.debugMode,
      status_word: input.statusWord,
      latest_error: input.latestError,
      last_run_result: input.lastRunResult,
      debug_traces: input.debugTraces,
      llm_exchanges: input.llmExchanges,
    },
    preview: {
      manifest_summary: input.preview.manifestSummary,
      entity_summary: input.preview.entitySummary,
      compile_errors: input.preview.compileErrors,
    },
  };
}

function downloadJsonFile(payload: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export function downloadStudioBundle(bundle: StudioBundleV1): void {
  downloadJsonFile(bundle, 'studio-bundle-v1.json');
}

export function downloadStudioDebugBundle(bundle: StudioDebugBundleV1): void {
  downloadJsonFile(bundle, 'studio-debug-bundle-v1.json');
}
