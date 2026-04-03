import type { ReactNode } from 'react';
import { EmptyState } from '../primitives/empty-state/EmptyState';
import { ErrorState } from '../primitives/error-state/ErrorState';
import { LoadingState } from '../primitives/loading-state/LoadingState';
import type { RenderState } from './render-state.types';

type RenderStateBoundaryProps = {
  state?: RenderState | null;
  children?: ReactNode;
};

export function RenderStateBoundary({ state, children }: RenderStateBoundaryProps) {
  if (!state) {
    return <>{children}</>;
  }

  if (state.kind === 'loading') {
    return <LoadingState {...state.state} />;
  }

  if (state.kind === 'empty') {
    return <EmptyState {...state.state} />;
  }

  return <ErrorState {...state.state} />;
}
