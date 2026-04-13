import type { RenderState } from '../../runtime/render-state.types';

export type MetricCardVariant = 'default' | 'compact' | 'emphasis';

export type MetricCardDensity = 'comfortable' | 'compact';

export type MetricCardDeltaDirection = 'up' | 'down' | 'neutral';

export type MetricCardTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

export type MetricCardResolvedAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type MetricCardViewProps = {
  variant: MetricCardVariant;
  density: MetricCardDensity;
  label: string;
  value: string;
  subtitle?: string;
  delta?: string;
  deltaDirection?: MetricCardDeltaDirection;
  tone: MetricCardTone;
  icon?: string;
  action?: MetricCardResolvedAction;
  renderState?: RenderState;
};
