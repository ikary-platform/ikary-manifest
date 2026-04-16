import type { EvalAggregateRow, EvalCaseExecution } from './case-schema';
import { DEFAULT_SCORER_WEIGHTS } from './weights';

export function computeWeightedScore(
  execution: EvalCaseExecution,
  weights: Record<string, number> = DEFAULT_SCORER_WEIGHTS,
): number {
  const totalWeight = execution.scorers.reduce((sum, scorer) => sum + (weights[scorer.scorer] ?? 1), 0);
  if (totalWeight === 0) return 0;

  const weighted = execution.scorers.reduce((sum, scorer) => {
    const weight = weights[scorer.scorer] ?? 1;
    return sum + scorer.score * weight;
  }, 0);

  return weighted / totalWeight;
}

export function aggregateExecutions(
  executions: EvalCaseExecution[],
  groupBy: (execution: EvalCaseExecution) => string,
  weights: Record<string, number> = DEFAULT_SCORER_WEIGHTS,
): EvalAggregateRow[] {
  const groups = new Map<string, EvalCaseExecution[]>();
  for (const execution of executions) {
    const key = groupBy(execution);
    groups.set(key, [...(groups.get(key) ?? []), execution]);
  }

  return [...groups.entries()].map(([key, group]) => ({
    key,
    totalCases: group.length,
    passedCases: group.filter((execution) => execution.status === 'completed' && execution.skipReason === undefined).length,
    averageScore: group.length === 0
      ? 0
      : group.reduce((sum, execution) => sum + computeWeightedScore(execution, weights), 0) / group.length,
  }));
}
