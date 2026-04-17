import { CellManifestV1Schema } from '@ikary/cell-contract';
import { AiTaskRunner } from '@ikary/system-ai/server';
import type { ManifestExecutorResult, ManifestTaskExecutor } from '@ikary/cell-ai/server';
import type { ManifestTaskInput } from '@ikary/cell-ai';
import type { PromptRegistry } from '@ikary/system-prompt';

export class EvalSystemAiManifestTaskExecutor implements ManifestTaskExecutor {
  readonly name = 'eval-system-ai-manifest-task-executor';

  constructor(
    private readonly aiTaskRunner: AiTaskRunner,
    private readonly prompts: PromptRegistry,
  ) {}

  async execute(input: {
    task: ManifestTaskInput;
    context: { promptContext: string };
  }): Promise<ManifestExecutorResult> {
    const systemPrompt = this.prompts.render(
      'cell-ai/manifest-task',
      { task_type: input.task.type },
      { taskName: 'cell-ai/manifest-task' },
    );
    try {
      const aiResult = await this.aiTaskRunner.runTask({
        taskId: toTaskId(input.task.type),
        promptPayload: input.context.promptContext,
        systemPrompt,
        temperature: 0.1,
        maxTokens: 3000,
        metadata: input.task.metadata,
        structuredOutput: {
          name: 'cell-manifest',
          schema: CellManifestV1Schema,
        },
      });

      return {
        manifest: aiResult.structured ?? aiResult.text,
        aiResult,
        systemPrompt,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        systemPrompt,
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
