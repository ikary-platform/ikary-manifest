export type LoadingStateVariant = 'page' | 'section' | 'card' | 'inline' | 'overlay';

export type LoadingStateDensity = 'comfortable' | 'compact';

export type LoadingStateMode = 'skeleton' | 'spinner' | 'mixed';

export type LoadingStateSkeletonView = {
  lines: number;
  blocks: number;
  avatar: boolean;
};

export type LoadingStateViewProps = {
  variant: LoadingStateVariant;
  density: LoadingStateDensity;
  mode: LoadingStateMode;
  label?: string;
  description?: string;
  skeleton?: LoadingStateSkeletonView;
};
