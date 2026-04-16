import { LegacyStudioContextAssembler } from './legacy-studio-context.assembler';
import { LegacyStudioTaskExecutor } from './legacy-studio-task.executor';
import {
  createBlueprintLoader,
  createSystemAiTaskRunner,
  createDefaultModularPipeline,
  getPromptRegistry,
} from './common';
import { DefaultKnowledgeProvider, HeuristicClarificationPolicy } from '@ikary/cell-ai/server';
import type { EvalCase } from '../core/case-schema';
import type { EvalPipelineAdapter, EvalPipelineContext, EvalPipelineResult } from './types';
import { FixtureManifestTaskExecutor } from '../providers/fixture-manifest.executor';

export class LegacyStudioReplayPipeline implements EvalPipelineAdapter {
  readonly name = 'legacy.studio-replay';
  readonly description = 'Legacy Studio-inspired replay using verbose multi-phase context assembly and modular validation.';

  supports(_testCase: EvalCase): string | null {
    return null;
  }

  async execute(task: Parameters<EvalPipelineAdapter['execute']>[0], context: EvalPipelineContext): Promise<EvalPipelineResult> {
    const blueprintLoader = createBlueprintLoader(context.repoRoot);
    const registry = await getPromptRegistry(context.repoRoot);
    const pipeline = await createDefaultModularPipeline(context, {
      knowledgeProvider: new DefaultKnowledgeProvider(blueprintLoader),
      contextAssembler: new LegacyStudioContextAssembler(),
      clarificationPolicy: new HeuristicClarificationPolicy(),
      executor: context.profile === 'fixture'
        ? new FixtureManifestTaskExecutor({
            name: this.name,
            model: `fixture/${this.name}`,
          })
        : new LegacyStudioTaskExecutor(createSystemAiTaskRunner(context.profile), registry),
    });

    return pipeline.execute(task);
  }
}
