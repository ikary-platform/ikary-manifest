export type EmptyStateVariant = 'initial' | 'search' | 'filter' | 'relation' | 'section' | 'widget';

export type EmptyStateDensity = 'comfortable' | 'compact';

export type EmptyStateResolvedAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type EmptyStateViewProps = {
  title: string;
  description?: string;
  icon?: string;
  variant: EmptyStateVariant;
  density: EmptyStateDensity;
  primaryAction?: EmptyStateResolvedAction;
  secondaryAction?: EmptyStateResolvedAction;
};
