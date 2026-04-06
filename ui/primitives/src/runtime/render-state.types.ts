import type { EmptyStateViewProps } from '../primitives/empty-state/EmptyState.types';
import type { ErrorStateViewProps } from '../primitives/error-state/ErrorState.types';
import type { LoadingStateViewProps } from '../primitives/loading-state/LoadingState.types';

export type LoadingRenderState = {
  kind: 'loading';
  state: LoadingStateViewProps;
};

export type EmptyRenderState = {
  kind: 'empty';
  state: EmptyStateViewProps;
};

export type ErrorRenderState = {
  kind: 'error';
  state: ErrorStateViewProps;
};

export type RenderState = LoadingRenderState | EmptyRenderState | ErrorRenderState;

export type RenderStateKind = RenderState['kind'];
