import type { ContextAssembler } from '@ikary/cell-ai/server';
import type { ContextAssembly, ManifestTaskInput } from '@ikary/cell-ai';

export class LegacyStudioContextAssembler implements ContextAssembler {
  readonly name = 'legacy-studio-context-assembler';

  async assemble(input: {
    task: ManifestTaskInput;
    retrieved: ContextAssembly['items'];
  }): Promise<ContextAssembly> {
    const sections = [
      `Legacy Studio Replay`,
      `Phase: ${input.task.type}`,
      `User Request:\n${input.task.prompt}`,
    ];

    if (input.task.manifest) {
      sections.push(`Current Artifacts:\n${JSON.stringify(input.task.manifest, null, 2)}`);
    }

    if (input.retrieved.length > 0) {
      sections.push(
        `Reference Material:\n${input.retrieved
          .map((item) => `- ${item.id}: ${item.summary}`)
          .join('\n')}`,
      );
    }

    if (Object.keys(input.task.clarificationAnswers).length > 0) {
      sections.push(`Approved Clarifications:\n${JSON.stringify(input.task.clarificationAnswers, null, 2)}`);
    }

    return {
      summary: `legacy studio replay, ${input.task.type} flow, ${input.retrieved.length} retrieved references`,
      promptContext: sections.join('\n\n'),
      assumptions: ['Legacy studio replay preserves existing structures unless the request explicitly changes them.'],
      items: input.retrieved,
    };
  }
}
