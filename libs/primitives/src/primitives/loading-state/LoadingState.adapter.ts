import type { LoadingStatePresentation } from '@ikary/presentation';
import type { LoadingStateMode, LoadingStateSkeletonView, LoadingStateViewProps } from './LoadingState.types';

export type BuildLoadingStateViewModelInput = {
  presentation: LoadingStatePresentation;
};

const DEFAULT_VARIANT: LoadingStateViewProps['variant'] = 'section';
const DEFAULT_DENSITY: LoadingStateViewProps['density'] = 'comfortable';
const DEFAULT_MODE: LoadingStateMode = 'skeleton';

const DEFAULT_SKELETON_LINES = 4;
const DEFAULT_SKELETON_BLOCKS = 1;

export function buildLoadingStateViewModel(input: BuildLoadingStateViewModelInput): LoadingStateViewProps {
  const mode = input.presentation.mode ?? DEFAULT_MODE;

  return {
    variant: input.presentation.variant ?? DEFAULT_VARIANT,
    density: input.presentation.density ?? DEFAULT_DENSITY,
    mode,
    label: normalizeOptionalText(input.presentation.label),
    description: normalizeOptionalText(input.presentation.description),
    skeleton: resolveSkeleton(mode, input.presentation.skeleton),
  };
}

function resolveSkeleton(
  mode: LoadingStateMode,
  skeleton: LoadingStatePresentation['skeleton'],
): LoadingStateSkeletonView | undefined {
  if (mode === 'spinner' && !skeleton) {
    return undefined;
  }

  return {
    lines: normalizePositiveInt(skeleton?.lines, DEFAULT_SKELETON_LINES),
    blocks: normalizePositiveInt(skeleton?.blocks, DEFAULT_SKELETON_BLOCKS),
    avatar: skeleton?.avatar ?? false,
  };
}

function normalizePositiveInt(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  const normalized = Math.trunc(value);
  return normalized > 0 ? normalized : fallback;
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
