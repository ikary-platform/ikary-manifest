import { Inject, Injectable } from '@nestjs/common';
import { CellManifestV1Schema } from '@ikary/cell-contract';
import { AiTaskRunner } from '@ikary/system-ai/server';
import { PromptRegistryService } from '@ikary/system-prompt/server';
import type { ManifestTaskExecutor, ManifestExecutorResult } from './interfaces';
import type { ManifestTaskInput } from '../../shared/pipeline.schema';

@Injectable()
export class SystemAiManifestTaskExecutor implements ManifestTaskExecutor {
  readonly name = 'system-ai-manifest-task-executor';

  constructor(
    @Inject(AiTaskRunner) private readonly aiTaskRunner: AiTaskRunner,
    @Inject(PromptRegistryService) private readonly prompts: PromptRegistryService,
  ) {}

  async execute(input: {
    task: ManifestTaskInput;
    context: { promptContext: string };
  }): Promise<ManifestExecutorResult> {
    const taskId = toTaskId(input.task.type);
    const systemPrompt = this.prompts.render(
      'cell-ai/manifest-task',
      { task_type: input.task.type },
      { taskName: 'cell-ai/manifest-task' },
    );
    try {
      const aiResult = await this.aiTaskRunner.runTask({
        taskId,
        promptPayload: input.context.promptContext,
        systemPrompt,
        temperature: 0.1,
        maxTokens: 3000,
        structuredOutput: {
          name: 'cell-manifest',
          schema: CellManifestV1Schema,
        },
      });

      return {
        manifest: aiResult.structured ?? aiResult.text,
        aiResult,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

function toTaskId(type: ManifestTaskInput['type']): string {
  switch (type) {
    case 'create':
      return 'manifest.create';
    case 'fix':
      return 'manifest.fix';
    case 'update':
      return 'manifest.update';
  }
}
