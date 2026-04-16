import type { EvalCaseExecution } from './case-schema';
import { computeWeightedScore } from './aggregation';
import type { EvalRunnerOptions } from './runner-schema';

export interface EvalDimensionSummary {
  readonly key: string;
  readonly totalCases: number;
  readonly completedCases: number;
  readonly failedCases: number;
  readonly clarificationCases: number;
  readonly skippedCases: number;
  readonly averageScore: number;
  readonly passRate: number;
}

export interface EvalScorerSummary {
  readonly scorer: string;
  readonly averageScore: number;
  readonly passRate: number;
  readonly failures: number;
}

export interface EvalReport {
  readonly generatedAt: string;
  readonly profile: string;
  readonly options: EvalRunnerOptions;
  readonly summary: EvalDimensionSummary;
  readonly byPipeline: EvalDimensionSummary[];
  readonly bySuite: EvalDimensionSummary[];
  readonly byTaskFamily: EvalDimensionSummary[];
  readonly byScorer: EvalScorerSummary[];
  readonly commonFailureReasons: Array<{ reason: string; count: number }>;
  readonly clarificationStats: {
    readonly askedCases: number;
    readonly resumedCases: number;
    readonly successfulAfterClarification: number;
  };
  readonly retrievalStats: {
    readonly averageHits: number;
    readonly casesWithHits: number;
    readonly averageContextChars: number;
  };
  readonly latency: {
    readonly averageMs: number;
    readonly maxMs: number;
  };
  readonly cost: {
    readonly totalUsd: number;
    readonly totalInputTokens: number;
    readonly totalOutputTokens: number;
  };
  readonly worstCases: Array<{
    readonly pipeline: string;
    readonly caseId: string;
    readonly status: EvalCaseExecution['status'];
    readonly averageScore: number;
    readonly diagnostics: string[];
  }>;
  readonly executions: EvalCaseExecution[];
}

export function buildEvalReport(
  executions: EvalCaseExecution[],
  options: EvalRunnerOptions,
): EvalReport {
  return {
    generatedAt: new Date().toISOString(),
    profile: options.profile,
    options,
    summary: summarizeDimension('overall', executions),
    byPipeline: summarizeBy(executions, (execution) => execution.pipeline),
    bySuite: summarizeBy(executions, (execution) => execution.suite),
    byTaskFamily: summarizeBy(executions, (execution) => execution.type),
    byScorer: summarizeScorers(executions),
    commonFailureReasons: summarizeFailureReasons(executions),
    clarificationStats: summarizeClarification(executions),
    retrievalStats: summarizeRetrieval(executions),
    latency: summarizeLatency(executions),
    cost: summarizeCost(executions),
    worstCases: executions
      .map((execution) => ({
        pipeline: execution.pipeline,
        caseId: execution.caseId,
        status: execution.status,
        averageScore: computeWeightedScore(execution),
        diagnostics: execution.scorers.flatMap((scorer) => scorer.diagnostics),
      }))
      .filter((execution) => execution.status !== 'skipped')
      .sort((left, right) => left.averageScore - right.averageScore)
      .slice(0, 10),
    executions,
  };
}

export function renderMarkdownReport(report: EvalReport): string {
  const lines: string[] = [
    '# IKARY Eval Report',
    '',
    `Generated: ${report.generatedAt}`,
    `Profile: ${report.profile}`,
    '',
    '## Summary',
    '',
    renderDimension(report.summary),
    '',
    '## Pipelines',
    '',
    ...renderDimensionTable(report.byPipeline),
    '',
    '## Suites',
    '',
    ...renderDimensionTable(report.bySuite),
    '',
    '## Task Families',
    '',
    ...renderDimensionTable(report.byTaskFamily),
    '',
    '## Scorers',
    '',
    '| Scorer | Avg Score | Pass Rate | Failures |',
    '| --- | ---: | ---: | ---: |',
    ...report.byScorer.map((row) => `| ${row.scorer} | ${formatNumber(row.averageScore)} | ${formatPercent(row.passRate)} | ${row.failures} |`),
    '',
    '## Clarification',
    '',
    `Asked cases: ${report.clarificationStats.askedCases}`,
    `Resumed cases: ${report.clarificationStats.resumedCases}`,
    `Successful after clarification: ${report.clarificationStats.successfulAfterClarification}`,
    '',
    '## Retrieval And Context',
    '',
    `Average retrieval hits: ${formatNumber(report.retrievalStats.averageHits)}`,
    `Cases with retrieval hits: ${report.retrievalStats.casesWithHits}`,
    `Average assembled context size: ${formatNumber(report.retrievalStats.averageContextChars)} chars`,
    '',
    '## Latency And Cost',
    '',
    `Average latency: ${formatNumber(report.latency.averageMs)} ms`,
    `Max latency: ${formatNumber(report.latency.maxMs)} ms`,
    `Total cost: $${formatNumber(report.cost.totalUsd)}`,
    `Total input tokens: ${report.cost.totalInputTokens}`,
    `Total output tokens: ${report.cost.totalOutputTokens}`,
    '',
    '## Common Failure Reasons',
    '',
    ...(
      report.commonFailureReasons.length > 0
        ? report.commonFailureReasons.map((item) => `- ${item.reason} (${item.count})`)
        : ['- None']
    ),
    '',
    '## Worst Cases',
    '',
    ...(
      report.worstCases.length > 0
        ? report.worstCases.map((item) => `- ${item.pipeline} / ${item.caseId}: ${item.status} @ ${formatNumber(item.averageScore)}${item.diagnostics.length > 0 ? ` — ${item.diagnostics[0]}` : ''}`)
        : ['- None']
    ),
    '',
  ];

  return lines.join('\n');
}

function summarizeBy(
  executions: EvalCaseExecution[],
  groupBy: (execution: EvalCaseExecution) => string,
): EvalDimensionSummary[] {
  const groups = new Map<string, EvalCaseExecution[]>();
  for (const execution of executions) {
    const key = groupBy(execution);
    groups.set(key, [...(groups.get(key) ?? []), execution]);
  }

  return [...groups.entries()]
    .map(([key, group]) => summarizeDimension(key, group))
    .sort((left, right) => left.key.localeCompare(right.key));
}

function summarizeDimension(key: string, executions: EvalCaseExecution[]): EvalDimensionSummary {
  const totalCases = executions.length;
  const completedCases = executions.filter((execution) => execution.status === 'completed').length;
  const failedCases = executions.filter((execution) => execution.status === 'failed').length;
  const clarificationCases = executions.filter((execution) => execution.status === 'needs_clarification').length;
  const skippedCases = executions.filter((execution) => execution.status === 'skipped').length;
  const activeExecutions = executions.filter((execution) => execution.status !== 'skipped');

  return {
    key,
    totalCases,
    completedCases,
    failedCases,
    clarificationCases,
    skippedCases,
    averageScore: activeExecutions.length === 0
      ? 0
      : activeExecutions.reduce((sum, execution) => sum + computeWeightedScore(execution), 0) / activeExecutions.length,
    passRate: activeExecutions.length === 0 ? 0 : completedCases / activeExecutions.length,
  };
}

function summarizeScorers(executions: EvalCaseExecution[]): EvalScorerSummary[] {
  const entries = new Map<string, Array<{ score: number; passed: boolean }>>();
  for (const execution of executions) {
    for (const scorer of execution.scorers) {
      entries.set(scorer.scorer, [...(entries.get(scorer.scorer) ?? []), { score: scorer.score, passed: scorer.passed }]);
    }
  }

  return [...entries.entries()]
    .map(([scorer, scores]) => ({
      scorer,
      averageScore: scores.reduce((sum, entry) => sum + entry.score, 0) / scores.length,
      passRate: scores.filter((entry) => entry.passed).length / scores.length,
      failures: scores.filter((entry) => !entry.passed).length,
    }))
    .sort((left, right) => left.scorer.localeCompare(right.scorer));
}

function summarizeFailureReasons(executions: EvalCaseExecution[]): Array<{ reason: string; count: number }> {
  const counts = new Map<string, number>();
  for (const execution of executions) {
    for (const scorer of execution.scorers) {
      for (const diagnostic of scorer.diagnostics) {
        counts.set(diagnostic, (counts.get(diagnostic) ?? 0) + 1);
      }
    }
  }

  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 15);
}

function summarizeClarification(executions: EvalCaseExecution[]) {
  const askedCases = executions.filter((execution) => {
    const raw = execution.rawResult as { initialResult?: { status?: string } };
    return raw.initialResult?.status === 'needs_clarification';
  }).length;
  const resumedCases = executions.filter((execution) => {
    const raw = execution.rawResult as { resumedResult?: unknown };
    return raw.resumedResult !== undefined;
  }).length;
  const successfulAfterClarification = executions.filter((execution) => {
    const raw = execution.rawResult as { initialResult?: { status?: string }; resumedResult?: { status?: string } };
    return raw.initialResult?.status === 'needs_clarification' && raw.resumedResult?.status === 'completed';
  }).length;

  return {
    askedCases,
    resumedCases,
    successfulAfterClarification,
  };
}

function summarizeRetrieval(executions: EvalCaseExecution[]) {
  const hits = executions.map((execution) => {
    const trace = getTrace(execution);
    return Array.isArray(trace.retrievalHits) ? trace.retrievalHits.length : 0;
  });
  const contextChars = executions.map((execution) => {
    const trace = getTrace(execution);
    return typeof trace.assembledContext === 'string' ? trace.assembledContext.length : 0;
  });

  return {
    averageHits: average(hits),
    casesWithHits: hits.filter((value) => value > 0).length,
    averageContextChars: average(contextChars),
  };
}

function summarizeLatency(executions: EvalCaseExecution[]) {
  const values = executions
    .map((execution) => {
      const trace = getTrace(execution);
      return typeof trace.timingMs === 'number' ? trace.timingMs : 0;
    });

  return {
    averageMs: average(values),
    maxMs: values.length === 0 ? 0 : Math.max(...values),
  };
}

function summarizeCost(executions: EvalCaseExecution[]) {
  const traces = executions.map((execution) => getTrace(execution));
  return {
    totalUsd: traces.reduce((sum, trace) => sum + (typeof trace.costUsd === 'number' ? trace.costUsd : 0), 0),
    totalInputTokens: traces.reduce((sum, trace) => sum + (typeof trace.inputTokens === 'number' ? trace.inputTokens : 0), 0),
    totalOutputTokens: traces.reduce((sum, trace) => sum + (typeof trace.outputTokens === 'number' ? trace.outputTokens : 0), 0),
  };
}

function renderDimension(row: EvalDimensionSummary): string {
  return [
    `Total cases: ${row.totalCases}`,
    `Completed: ${row.completedCases}`,
    `Failed: ${row.failedCases}`,
    `Needs clarification: ${row.clarificationCases}`,
    `Skipped: ${row.skippedCases}`,
    `Average score: ${formatNumber(row.averageScore)}`,
    `Pass rate: ${formatPercent(row.passRate)}`,
  ].join('\n');
}

function renderDimensionTable(rows: EvalDimensionSummary[]): string[] {
  return [
    '| Key | Total | Completed | Failed | Clarification | Skipped | Avg Score | Pass Rate |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...rows.map((row) => `| ${row.key} | ${row.totalCases} | ${row.completedCases} | ${row.failedCases} | ${row.clarificationCases} | ${row.skippedCases} | ${formatNumber(row.averageScore)} | ${formatPercent(row.passRate)} |`),
  ];
}

function getTrace(execution: EvalCaseExecution): Record<string, unknown> {
  const raw = execution.rawResult as { finalResult?: { trace?: Record<string, unknown> } };
  return raw.finalResult?.trace ?? {};
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatNumber(value: number): string {
  return value.toFixed(2);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
