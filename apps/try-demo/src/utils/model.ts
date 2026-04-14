/**
 * Pure model helpers used by every badge/meter that surfaces which model
 * ran the generation. Consolidates copies that used to live in
 * `chrome/HeaderMeta.tsx` and the now-retired `render/ModelBadge.tsx`.
 *
 * Prices are coarse approximations for the "declarative is cheaper than
 * code-gen" narrative; they power the token meter display only, never any
 * billing or budget logic.
 */

export function shortenModel(id: string): string {
  const slash = id.indexOf('/');
  return slash >= 0 ? id.slice(slash + 1) : id;
}

export function isFreeModel(id: string): boolean {
  return id.toLowerCase().includes(':free');
}

/** USD per 1,000,000 input or output tokens. `null` means the model isn't in our price table. */
interface ModelPrice {
  input: number;
  output: number;
}

function priceFor(model: string): ModelPrice | null {
  if (isFreeModel(model)) return { input: 0, output: 0 };
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

export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number | null {
  const p = priceFor(model);
  if (!p) return null;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}
