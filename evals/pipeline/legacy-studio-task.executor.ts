import { CellManifestV1Schema } from '@ikary/cell-contract';
import { AiTaskRunner } from '@ikary/system-ai/server';
import type { ManifestExecutorResult, ManifestTaskExecutor } from '@ikary/cell-ai/server';
import type { ManifestTaskInput } from '@ikary/cell-ai';
import type { PromptRegistry } from '@ikary/system-prompt';

export class LegacyStudioTaskExecutor implements ManifestTaskExecutor {
  readonly name = 'legacy-studio-task-executor';

  constructor(
    private readonly taskRunner: AiTaskRunner,
    private readonly prompts: PromptRegistry,
  ) {}

  async execute(input: {
    task: ManifestTaskInput;
    context: { promptContext: string };
  }): Promise<ManifestExecutorResult> {
    const systemPrompt = this.prompts.render(
      'evals/legacy-studio-task',
      { task_type: input.task.type },
      { taskName: 'evals/legacy-studio-task' },
    );
    try {
      const aiResult = await this.taskRunner.runTask({
        taskId: toTaskId(input.task.type),
        promptPayload: input.context.promptContext,
        systemPrompt,
        temperature: 0.05,
        maxTokens: 3200,
        metadata: {
          adapter: 'legacy.studio-replay',
          ...input.task.metadata,
        },
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
