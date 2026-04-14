import { estimateCostUsd } from '../../utils/model';

interface Props {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export function TokenMeter({ model, inputTokens, outputTokens }: Props) {
  const total = inputTokens + outputTokens;
  if (total === 0) return null;

  const cost = estimateCostUsd(model, inputTokens, outputTokens);
  const title = `${inputTokens} in · ${outputTokens} out`;

  return (
    <span className="meta-tokens" title={title}>
      {total.toLocaleString()} tokens
      {cost !== null && <span className="meta-tokens-cost">· ${cost.toFixed(4)}</span>}
    </span>
  );
}
