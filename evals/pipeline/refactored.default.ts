import type { EvalCase } from '../core/case-schema';
import type { EvalPipelineAdapter, EvalPipelineContext, EvalPipelineResult } from './types';
import { createDefaultModularPipeline } from './common';

export class RefactoredDefaultPipeline implements EvalPipelineAdapter {
  readonly name = 'refactored.default';
  readonly description = 'Modular retrieval + context + clarification + execution + validation pipeline.';

  supports(_testCase: EvalCase): string | null {
    return null;
  }

  async execute(task: Parameters<EvalPipelineAdapter['execute']>[0], context: EvalPipelineContext): Promise<EvalPipelineResult> {
    const pipeline = await createDefaultModularPipeline(context);
    return pipeline.execute(task);
  }
}
