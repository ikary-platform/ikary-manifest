import { isFreeModel, shortenModel } from '../../utils/model';

interface Props {
  provider: string | null;
  model: string;
  attempt: number;
  chainLength: number;
}

export function ModelBadge({ provider, model, attempt, chainLength }: Props) {
  const title = `${provider ?? ''} · attempt ${attempt}/${chainLength}`;
  return (
    <span className="meta-model" title={title}>
      <span className="meta-model-icon" aria-hidden="true">
        ◆
      </span>
      <span className="meta-model-name">{shortenModel(model)}</span>
      {isFreeModel(model) && <span className="meta-model-tag">FREE</span>}
      {chainLength > 1 && (
        <span className="meta-model-attempt">
          {attempt}/{chainLength}
        </span>
      )}
    </span>
  );
}
