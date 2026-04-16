import { BaselineNoRagPipeline } from './baseline.no-rag';
import { LegacyStudioReplayPipeline } from './legacy.studio-replay';
import { LegacyTryApiPipeline } from './legacy.try-api';
import { RefactoredDefaultPipeline } from './refactored.default';
import type { EvalPipelineAdapter } from './types';

export function createPipelineRegistry(): EvalPipelineAdapter[] {
  return [
    new RefactoredDefaultPipeline(),
    new BaselineNoRagPipeline(),
    new LegacyTryApiPipeline(),
    new LegacyStudioReplayPipeline(),
  ];
}
