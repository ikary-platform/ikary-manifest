import { Injectable } from '@nestjs/common';
import type { ClarificationPolicy, ClarificationDecision } from './interfaces';
import type { ManifestTaskInput } from '../../shared/pipeline.schema';

@Injectable()
export class HeuristicClarificationPolicy implements ClarificationPolicy {
  readonly name = 'heuristic-clarification-policy';

  async decide(input: {
    task: ManifestTaskInput;
  }): Promise<ClarificationDecision> {
    const assumptions: string[] = [];

    if ((input.task.type === 'fix' || input.task.type === 'update') && !input.task.manifest) {
      return {
        kind: 'fail',
        assumptions,
        error: `${input.task.type.toUpperCase()} tasks require an existing manifest.`,
        policySummary: 'Rejected because the task requires an existing manifest.',
      };
    }

    if (input.task.clarificationMode === 'disabled') {
      assumptions.push('Clarification is disabled, so the pipeline should proceed with defaults.');
      return {
        kind: 'proceed',
        assumptions,
        policySummary: 'Clarification disabled; proceeding with defaults and assumptions.',
      };
    }

    const questionId = 'scope-depth';
    const clarificationAnswer = input.task.clarificationAnswers[questionId];

    if (clarificationAnswer) {
      assumptions.push(`Clarification answer applied for ${questionId}: ${clarificationAnswer}.`);
      return {
        kind: 'proceed',
        assumptions,
        policySummary: 'Clarification answer supplied; proceeding with resolved scope.',
      };
    }

    if (shouldAskClarification(input.task)) {
      return {
        kind: 'ask',
        assumptions,
        policySummary: 'Prompt is underspecified; asking one structured clarification question.',
        questions: [
          {
            id: questionId,
            question: 'How detailed should the generated application be?',
            reason: 'The prompt is too short to infer whether a minimal or expanded domain model is expected.',
            options: ['minimal', 'standard', 'extended'],
          },
        ],
      };
    }

    return {
      kind: 'proceed',
      assumptions,
      policySummary: 'Prompt is specific enough to proceed without clarification.',
    };
  }
}

function shouldAskClarification(task: ManifestTaskInput): boolean {
  const normalized = task.prompt.trim().toLowerCase();
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  return task.type === 'create' && wordCount <= 4;
}
