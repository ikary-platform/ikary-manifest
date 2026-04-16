import type {
  ClarificationDecision,
  ClarificationPolicy,
} from '@ikary/cell-ai/server';
import type { ManifestTaskInput } from '@ikary/cell-ai';

export class AlwaysProceedClarificationPolicy implements ClarificationPolicy {
  readonly name = 'always-proceed-clarification-policy';

  async decide(input: { task: ManifestTaskInput }): Promise<ClarificationDecision> {
    if ((input.task.type === 'fix' || input.task.type === 'update') && !input.task.manifest) {
      return {
        kind: 'fail',
        assumptions: [],
        error: `${input.task.type.toUpperCase()} tasks require an existing manifest.`,
        policySummary: 'Rejected because the task requires an existing manifest.',
      };
    }

    const assumptions = input.task.clarificationMode === 'enabled'
      ? ['Structured clarification is disabled for this legacy adapter, so defaults were applied.']
      : [];

    return {
      kind: 'proceed',
      assumptions,
      policySummary: 'Legacy adapter always proceeds with defaults instead of structured clarification.',
    };
  }
}
