import type { StreamState } from '../stream/stream-state';

interface Props {
  state: StreamState;
}

const STAGE_LABEL: Record<StreamState['stage'], string> = {
  idle: 'idle',
  generating: 'generating',
  streaming: 'streaming',
  final: 'final',
  error: 'error',
};

export function HeaderMeta({ state }: Props) {
  const isActive = state.stage === 'generating' || state.stage === 'streaming';
  const showStage = state.stage !== 'idle';
  const tokens = state.inputTokens + state.outputTokens;
  const cost = state.model ? estimateCostUsd(state.model, state.inputTokens, state.outputTokens) : null;

  return (
    <div className="app-header-meta">
      {showStage && (
        <span className="meta-stage">
          <span className={`meta-stage-dot ${isActive ? 'is-active' : ''}`} />
          {STAGE_LABEL[state.stage]}
        </span>
      )}
      {state.model && (
        <span className="meta-model" title={`${state.provider} · attempt ${state.attempt}/${state.chainLength}`}>
          <span style={{ color: 'var(--ob-text-accent)' }}>◆</span>
          <span className="meta-model-name">{shortenModel(state.model)}</span>
          {state.model.toLowerCase().includes(':free') && <span className="meta-model-tag">FREE</span>}
          {state.chainLength > 1 && (
            <span style={{ color: 'var(--ob-text-muted)', fontSize: 10 }}>
              {state.attempt}/{state.chainLength}
            </span>
          )}
        </span>
      )}
      {tokens > 0 && (
        <span className="meta-tokens" title={`${state.inputTokens} in · ${state.outputTokens} out`}>
          {tokens.toLocaleString()} tokens
          {cost !== null && <span className="meta-tokens-cost">· ${cost.toFixed(4)}</span>}
        </span>
      )}
      {state.fallbacks.map((f, i) => (
        <span key={i} className="meta-fallback" title={`${f.reason}: ${f.fromModel} → ${f.nextModel}`}>
          ↻ {shortenModel(f.fromModel)}
        </span>
      ))}
    </div>
  );
}

function shortenModel(id: string): string {
  const slash = id.indexOf('/');
  return slash >= 0 ? id.slice(slash + 1) : id;
}

function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number | null {
  if (model.includes(':free')) return 0;
  const p = priceTable(model);
  if (!p) return null;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

function priceTable(model: string): { input: number; output: number } | null {
  if (model.includes('claude-sonnet-4')) return { input: 3, output: 15 };
  if (model.includes('claude-haiku')) return { input: 0.8, output: 4 };
  if (model.includes('gpt-4.1-mini')) return { input: 0.4, output: 1.6 };
  if (model.includes('gpt-4.1')) return { input: 2, output: 8 };
  if (model.includes('gpt-oss')) return { input: 0.3, output: 0.6 };
  if (model.includes('gemini-2.0-flash')) return { input: 0.1, output: 0.4 };
  if (model.includes('llama-3.3-70b')) return { input: 0.59, output: 0.79 };
  if (model.includes('qwen3') || model.includes('qwen-2.5')) return { input: 0.4, output: 0.4 };
  if (model.includes('gemma')) return { input: 0.05, output: 0.1 };
  return null;
}
