export type ErrorStateVariant = 'page' | 'section' | 'inline' | 'network' | 'unexpected' | 'notFound';

export type ErrorStateSeverity = 'soft' | 'blocking';

export type ErrorStateResolvedAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type ErrorStateTechnicalDetailsView = {
  code?: string;
  correlationId?: string;
  message?: string;
};

export type ErrorStateViewProps = {
  title: string;
  description?: string;
  icon?: string;
  variant: ErrorStateVariant;
  severity: ErrorStateSeverity;
  retryAction?: ErrorStateResolvedAction;
  secondaryAction?: ErrorStateResolvedAction;
  technicalDetails?: ErrorStateTechnicalDetailsView;
};
