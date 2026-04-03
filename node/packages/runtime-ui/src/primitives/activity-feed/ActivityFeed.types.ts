import type { RenderState } from '../../runtime/render-state.types';

export type ActivityFeedVariant = 'default' | 'compact' | 'timeline';

export type ActivityFeedDensity = 'comfortable' | 'compact';

export type ActivityFeedTone = 'default' | 'info' | 'success' | 'warning' | 'danger';

export type ActivityFeedResolvedAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type ActivityFeedResolvedItem = {
  key: string;
  summary: string;
  actor?: string;
  timestamp?: string;
  targetLabel?: string;
  icon?: string;
  tone: ActivityFeedTone;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type ActivityFeedViewProps = {
  variant: ActivityFeedVariant;
  density: ActivityFeedDensity;
  title?: string;
  subtitle?: string;
  items: ActivityFeedResolvedItem[];
  limit?: number;
  action?: ActivityFeedResolvedAction;
  renderState?: RenderState;
};
