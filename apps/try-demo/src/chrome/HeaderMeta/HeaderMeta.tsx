import type { StreamState } from '../../stream/stream-state';
import { StageBadge } from './StageBadge';
import { ModelBadge } from './ModelBadge';
import { TokenMeter } from './TokenMeter';
import { FallbackTrail } from './FallbackTrail';

interface Props {
  state: StreamState;
}

/**
 * Live meta strip rendered next to the `try` badge in the app header.
 * Pure composition: delegates every pill to a focused sub-component and
 * only owns the decision of whether to render the strip at all.
 */
export function HeaderMeta({ state }: Props) {
  const hasAnything =
    state.stage !== 'idle' ||
    state.model !== null ||
    state.inputTokens + state.outputTokens > 0 ||
    state.fallbacks.length > 0;

  if (!hasAnything) return null;

  return (
    <div className="app-header-meta">
      {state.stage !== 'idle' && <StageBadge stage={state.stage} />}
      {state.model && (
        <ModelBadge
          provider={state.provider}
          model={state.model}
          attempt={state.attempt}
          chainLength={state.chainLength}
        />
      )}
      {state.model && (
        <TokenMeter
          model={state.model}
          inputTokens={state.inputTokens}
          outputTokens={state.outputTokens}
        />
      )}
      <FallbackTrail fallbacks={state.fallbacks} />
    </div>
  );
}
