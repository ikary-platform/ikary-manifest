import type { EvalCase } from '../core/case-schema';
import type { EvalPipelineAdapter, EvalPipelineContext, EvalPipelineResult } from './types';
import { createDefaultModularPipeline } from './common';
import { NoopKnowledgeProvider } from './noop-knowledge.provider';

export class BaselineNoRagPipeline implements EvalPipelineAdapter {
  readonly name = 'baseline.no-rag';
  readonly description = 'Refactored pipeline with retrieval disabled for regression comparisons.';

  supports(_testCase: EvalCase): string | null {
    return null;
  }

  async execute(task: Parameters<EvalPipelineAdapter['execute']>[0], context: EvalPipelineContext): Promise<EvalPipelineResult> {
    const pipeline = await createDefaultModularPipeline(context, {
      knowledgeProvider: new NoopKnowledgeProvider(),
    });
    return pipeline.execute(task);
  }
}
