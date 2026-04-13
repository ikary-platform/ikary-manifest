import type { ModelFallback } from '../stream/stream-state';

interface Props {
  provider: string | null;
  model: string | null;
  attempt: number;
  chainLength: number;
  fallbacks: ModelFallback[];
  inputTokens: number;
  outputTokens: number;
}

export function ModelBadge({ provider, model, attempt, chainLength, fallbacks, inputTokens, outputTokens }: Props) {
  if (!model) return null;
  const isFree = model.toLowerCase().includes(':free');
  const tokenCost = estimateCostUsd(model, inputTokens, outputTokens);

  return (
    <div className="model-badge-row">
      <div className={`model-badge ${isFree ? 'model-badge-free' : ''}`} title={`${provider ?? ''} · attempt ${attempt}/${chainLength}`}>
        <span className="model-badge-icon" aria-hidden="true">◆</span>
        <span className="model-badge-name">{shortenModel(model)}</span>
        {isFree && <span className="model-badge-tag">FREE</span>}
        {chainLength > 1 && (
          <span className="model-badge-attempt">
            {attempt}/{chainLength}
          </span>
        )}
      </div>
      {outputTokens > 0 && (
        <div className="token-meter" title={`${inputTokens} in · ${outputTokens} out`}>
          <span className="token-meter-count">{(inputTokens + outputTokens).toLocaleString()} tokens</span>
          {tokenCost !== null && <span className="token-meter-cost">· ${tokenCost.toFixed(4)}</span>}
        </div>
      )}
      {fallbacks.length > 0 && (
        <div className="fallback-trail" aria-label="Fallback chain">
          {fallbacks.map((f, i) => (
            <span key={i} className="fallback-pill" title={`${f.reason}: ${f.fromModel} → ${f.nextModel}`}>
              ↻ {shortenModel(f.fromModel)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function shortenModel(id: string): string {
  // "anthropic/claude-sonnet-4-5" → "claude-sonnet-4-5"
  const slash = id.indexOf('/');
  return slash >= 0 ? id.slice(slash + 1) : id;
}

/**
 * Rough cost estimation per 1M tokens. Rounded pricing - good enough to
 * demonstrate the "this was generated for $0.00xx" narrative; not billing.
 */
function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number | null {
  const prices = priceTable(model);
  if (!prices) return null;
  return (inputTokens / 1_000_000) * prices.input + (outputTokens / 1_000_000) * prices.output;
}

function priceTable(model: string): { input: number; output: number } | null {
  if (model.includes(':free')) return { input: 0, output: 0 };
  if (model.includes('claude-sonnet-4') || model.includes('claude-sonnet-4-5')) return { input: 3, output: 15 };
  if (model.includes('claude-haiku')) return { input: 0.8, output: 4 };
  if (model.includes('gpt-4.1-mini')) return { input: 0.4, output: 1.6 };
  if (model.includes('gpt-4.1')) return { input: 2, output: 8 };
  if (model.includes('gemini-2.0-flash')) return { input: 0.1, output: 0.4 };
  if (model.includes('llama-3.3-70b')) return { input: 0.59, output: 0.79 };
  if (model.includes('qwen-2.5-72b')) return { input: 0.4, output: 0.4 };
  return null;
}
