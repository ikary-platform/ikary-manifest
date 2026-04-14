import { shortenModel } from '../../utils/model';
import type { ModelFallback } from '../../stream/stream-state';

interface Props {
  fallbacks: ModelFallback[];
}

export function FallbackTrail({ fallbacks }: Props) {
  if (fallbacks.length === 0) return null;
  return (
    <>
      {fallbacks.map((f, i) => (
        <span
          key={`${f.fromModel}-${i}`}
          className="meta-fallback"
          title={`${f.reason}: ${f.fromModel} → ${f.nextModel}`}
        >
          ↻ {shortenModel(f.fromModel)}
        </span>
      ))}
    </>
  );
}
