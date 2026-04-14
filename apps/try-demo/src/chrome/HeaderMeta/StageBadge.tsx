import type { StreamState } from '../../stream/stream-state';

const STAGE_LABEL: Record<StreamState['stage'], string> = {
  idle: 'idle',
  generating: 'generating',
  streaming: 'streaming',
  final: 'final',
  error: 'error',
};

interface Props {
  stage: StreamState['stage'];
}

export function StageBadge({ stage }: Props) {
  const isActive = stage === 'generating' || stage === 'streaming';
  const dotClass = isActive ? 'meta-stage-dot is-active' : 'meta-stage-dot';
  return (
    <span className="meta-stage">
      <span className={dotClass} aria-hidden="true" />
      {STAGE_LABEL[stage]}
    </span>
  );
}
