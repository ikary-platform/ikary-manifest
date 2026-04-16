import { describe, expect, it } from 'vitest';
import { buildEvalReport, renderMarkdownReport } from '../core/reporting';
import createTaskTrackerCase from '../cases/create/task-tracker.case';
import { buildManifestTaskInput } from '../core/task-input';
import { RefactoredDefaultPipeline } from '../pipeline/refactored.default';
import { runDefaultScorers } from '../scorers';

describe('scorers and reporting', () => {
  it('scores a fixture-backed case and builds reports', async () => {
    const pipeline = new RefactoredDefaultPipeline();
    const context = {
      repoRoot: process.cwd(),
      profile: 'fixture',
      clarificationMode: 'disabled' as const,
      runtimeMode: 'compile-only' as const,
    };

    const result = await pipeline.execute(
      buildManifestTaskInput(createTaskTrackerCase, 'disabled'),
      context,
    );
    expect(result.status).toBe('completed');

    const scorers = runDefaultScorers(createTaskTrackerCase, {
      initialResult: result,
      finalResult: result,
    });
    expect(scorers.find((entry) => entry.scorer === 'parseValidScorer')?.passed).toBe(true);

    const report = buildEvalReport([
      {
        pipeline: pipeline.name,
        profile: context.profile,
        caseId: createTaskTrackerCase.id,
        suite: createTaskTrackerCase.suite,
        type: createTaskTrackerCase.type,
        status: result.status,
        scorers,
        rawResult: { initialResult: result, finalResult: result },
        startedAt: new Date(0).toISOString(),
        completedAt: new Date(0).toISOString(),
      },
    ], {
      casesDir: 'evals/cases',
      reportsDir: 'evals/reports',
      profile: 'fixture',
      pipelines: [],
      suites: [],
      types: [],
      tags: [],
      caseIds: [],
      clarificationMode: 'disabled',
      runtimeMode: 'compile-only',
      outputJsonFile: 'eval-report.json',
      outputMarkdownFile: 'eval-report.md',
    });

    expect(report.summary.totalCases).toBe(1);
    expect(report.summary.completedCases).toBe(1);
    expect(renderMarkdownReport(report)).toContain('IKARY Eval Report');
  });
});
