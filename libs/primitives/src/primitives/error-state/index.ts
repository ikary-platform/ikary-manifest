export { ErrorState } from './ErrorState';
export { buildErrorStateViewModel, type BuildErrorStateViewModelInput } from './ErrorState.adapter';
export { resolveErrorState, type ErrorStateResolverRuntime } from './ErrorState.resolver';
export { registerErrorState } from './ErrorState.register';
export type {
  ErrorStateResolvedAction,
  ErrorStateSeverity,
  ErrorStateTechnicalDetailsView,
  ErrorStateVariant,
  ErrorStateViewProps,
} from './ErrorState.types';
