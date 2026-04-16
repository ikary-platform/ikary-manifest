import { Injectable } from '@nestjs/common';
import type { ContextAssembler } from './interfaces';
import type { ContextAssembly, ManifestTaskInput } from '../../shared/pipeline.schema';

@Injectable()
export class DefaultContextAssembler implements ContextAssembler {
  readonly name = 'default-context-assembler';

  async assemble(input: {
    task: ManifestTaskInput;
    retrieved: ContextAssembly['items'];
  }): Promise<ContextAssembly> {
    const assumptions: string[] = [];
    if (input.task.type === 'create') {
      assumptions.push('Use sensible CRUD defaults unless the prompt explicitly requests otherwise.');
    }

    const sections = [
      `Task Type: ${input.task.type}`,
      `Prompt:\n${input.task.prompt}`,
    ];

    if (input.task.manifest) {
      sections.push(`Existing Manifest:\n${JSON.stringify(input.task.manifest, null, 2)}`);
    }

    if (Object.keys(input.task.clarificationAnswers).length > 0) {
      sections.push(`Clarification Answers:\n${JSON.stringify(input.task.clarificationAnswers, null, 2)}`);
    }

    if (input.retrieved.length > 0) {
      sections.push(
        `Retrieved Context:\n${input.retrieved
          .map((item) => `- ${item.title}: ${item.summary}`)
          .join('\n')}`,
      );
    }

    return {
      summary: buildSummary(input.task, input.retrieved.length),
      promptContext: sections.join('\n\n'),
      assumptions,
      items: input.retrieved,
    };
  }
}

function buildSummary(task: ManifestTaskInput, retrievalCount: number): string {
  return [
    `${task.type.toUpperCase()} manifest task`,
    retrievalCount > 0 ? `${retrievalCount} retrieval hit(s)` : 'no retrieval hits',
    task.manifest ? 'existing manifest attached' : 'no existing manifest',
  ].join(', ');
}
