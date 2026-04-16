import { describe, expect, it } from 'vitest';
import { escapeHtml, renderHtmlReport } from '../core/html-renderer';
import type { EvalCaseExecution } from '../core/case-schema';
import type { EvalReport } from '../core/reporting';

function execution(over: Partial<EvalCaseExecution> = {}): EvalCaseExecution {
  const base: EvalCaseExecution = {
    pipeline: 'refactored.default',
    profile: 'fixture',
    caseId: 'create.task-tracker',
    suite: 'create',
    type: 'create',
    status: 'completed',
    scorers: [
      {
        scorer: 'schemaValidScorer',
        score: 1,
        passed: true,
        diagnostics: [],
        evidence: { ok: true },
      },
      {
        scorer: 'expectedEntitiesScorer',
        score: 0.5,
        passed: false,
        diagnostics: ['Missing entity: project'],
      },
    ],
    rawResult: {
      finalResult: {
        status: 'completed',
        manifest: { kind: 'Cell' },
        assumptions: ['Assumed snake_case keys'],
        trace: {
          taskType: 'create',
          retrievalHits: [
            { id: 'ex/task-tracker', type: 'manifest', title: 'Task Tracker example', score: 0.92 },
          ],
          contextSummary: 'Used 1 example manifest',
          assembledContext: 'Plain prompt context.',
          policyDecisions: ['Proceeded without clarification'],
          assumptions: ['Assumed snake_case keys'],
          timingMs: 12,
          validation: [
            { stage: 'parse', passed: true, errors: [] },
            { stage: 'schema', passed: true, errors: [] },
          ],
          provider: 'fixture',
          model: 'fixture/refactored.default',
          inputTokens: 64,
          outputTokens: 128,
          diagnostics: [],
        },
      },
    },
    startedAt: '2026-04-16T11:00:00.000Z',
    completedAt: '2026-04-16T11:00:00.012Z',
  };
  return { ...base, ...over };
}

function report(over: Partial<EvalReport> = {}): EvalReport {
  const executions = over.executions ?? [execution()];
  const base: EvalReport = {
    generatedAt: '2026-04-16T11:00:00.000Z',
    profile: 'fixture',
    options: {
      profile: 'fixture',
      suites: [],
      types: [],
      tags: [],
      pipelines: [],
      caseIds: [],
      clarificationMode: 'enabled',
      runtimeMode: 'compile',
      casesDir: '/tmp/cases',
      reportsDir: '/tmp/reports',
      outputJsonFile: 'eval-report.json',
      outputMarkdownFile: 'eval-report.md',
    } as EvalReport['options'],
    summary: {
      key: 'overall',
      totalCases: executions.length,
      completedCases: executions.filter((e) => e.status === 'completed').length,
      failedCases: executions.filter((e) => e.status === 'failed').length,
      clarificationCases: executions.filter((e) => e.status === 'needs_clarification').length,
      skippedCases: executions.filter((e) => e.status === 'skipped').length,
      averageScore: 0.94,
      passRate: 1,
    },
    byPipeline: [
      { key: 'refactored.default', totalCases: 1, completedCases: 1, failedCases: 0, clarificationCases: 0, skippedCases: 0, averageScore: 0.94, passRate: 1 },
    ],
    bySuite: [
      { key: 'create', totalCases: 1, completedCases: 1, failedCases: 0, clarificationCases: 0, skippedCases: 0, averageScore: 0.94, passRate: 1 },
    ],
    byTaskFamily: [
      { key: 'create', totalCases: 1, completedCases: 1, failedCases: 0, clarificationCases: 0, skippedCases: 0, averageScore: 0.94, passRate: 1 },
    ],
    byScorer: [
      { scorer: 'schemaValidScorer', averageScore: 1, passRate: 1, failures: 0 },
      { scorer: 'expectedEntitiesScorer', averageScore: 0.5, passRate: 0, failures: 1 },
    ],
    commonFailureReasons: [{ reason: 'Missing entity: project', count: 1 }],
    clarificationStats: { askedCases: 0, resumedCases: 0, successfulAfterClarification: 0 },
    retrievalStats: { averageHits: 1, casesWithHits: 1, averageContextChars: 50 },
    latency: { averageMs: 12, maxMs: 12 },
    cost: { totalUsd: 0, totalInputTokens: 64, totalOutputTokens: 128 },
    worstCases: [
      {
        pipeline: 'refactored.default',
        caseId: 'create.task-tracker',
        status: 'completed',
        averageScore: 0.5,
        diagnostics: ['Missing entity: project'],
      },
    ],
    executions,
  };
  return { ...base, ...over };
}

describe('renderHtmlReport', () => {
  it('renders a complete HTML document with the expected sections', () => {
    const html = renderHtmlReport(report());
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<title>');
    expect(html).toContain('IKARY Eval Report');
    expect(html).toContain('Profile: fixture');
    expect(html).toContain('By pipeline');
    expect(html).toContain('By scorer');
    expect(html).toContain('Operational');
    expect(html).toContain('Worst cases');
    expect(html).toContain('Case executions');
  });

  it('emits headline stats from the summary', () => {
    const html = renderHtmlReport(report());
    expect(html).toContain('>1<');
    expect(html).toContain('Total');
    expect(html).toContain('Completed');
    expect(html).toContain('Pass rate');
    expect(html).toContain('100.0%');
  });

  it('renders one case detail per execution with model + scorers + trace', () => {
    const html = renderHtmlReport(report());
    expect(html).toContain('fixture/refactored.default');
    expect(html).toContain('refactored.default / create / create.task-tracker');
    expect(html).toContain('schemaValidScorer');
    expect(html).toContain('expectedEntitiesScorer');
    expect(html).toContain('Missing entity: project');
    expect(html).toContain('Task Tracker example');
    expect(html).toContain('Assembled context');
  });

  it('escapes HTML special characters in case-supplied strings', () => {
    const evil = '<script>alert(1)</script>&"\'';
    const html = renderHtmlReport(
      report({
        executions: [
          execution({
            caseId: evil,
            scorers: [
              {
                scorer: 'schemaValidScorer',
                score: 0,
                passed: false,
                diagnostics: [evil],
              },
            ],
          }),
        ],
      }),
    );
    expect(html).not.toContain(evil);
    expect(html).toContain(escapeHtml(evil));
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('escapes data-attributes derived from case content', () => {
    const html = renderHtmlReport(
      report({
        executions: [execution({ caseId: 'has "quotes" & <stuff>' })],
      }),
    );
    expect(html).toContain('&quot;quotes&quot;');
    expect(html).not.toContain('"quotes"');
    expect(html).not.toContain('& <stuff>');
  });

  it('renders the four status badges that map to each EvalCaseExecution status', () => {
    const html = renderHtmlReport(
      report({
        executions: [
          execution({ caseId: 'a', status: 'completed' }),
          execution({ caseId: 'b', status: 'failed' }),
          execution({ caseId: 'c', status: 'needs_clarification' }),
          execution({ caseId: 'd', status: 'skipped', skipReason: 'pipeline does not support this case' }),
        ],
      }),
    );
    expect(html).toContain('status-completed');
    expect(html).toContain('status-failed');
    expect(html).toContain('status-needs_clarification');
    expect(html).toContain('status-skipped');
    expect(html).toContain('pipeline does not support this case');
  });

  it('renders a non-empty document when there are zero executions', () => {
    const html = renderHtmlReport(
      report({
        executions: [],
        summary: {
          key: 'overall',
          totalCases: 0,
          completedCases: 0,
          failedCases: 0,
          clarificationCases: 0,
          skippedCases: 0,
          averageScore: 0,
          passRate: 0,
        },
        byPipeline: [],
        bySuite: [],
        byTaskFamily: [],
        byScorer: [],
        commonFailureReasons: [],
        worstCases: [],
      }),
    );
    expect(html).toContain('No cases executed.');
    expect(html).toContain('No data.');
    expect(html).toContain('No scorers reported.');
    expect(html).toContain('No failures recorded.');
  });

  it('uses a stable in-page anchor that links from the worst-cases table to the case detail', () => {
    const html = renderHtmlReport(report());
    const linkMatch = html.match(/href="#(case-\d+-[a-z0-9-]+)"/);
    expect(linkMatch).not.toBeNull();
    if (linkMatch) {
      expect(html).toContain(`id="${linkMatch[1]}"`);
    }
  });

  it('falls back gracefully when the trace is missing or malformed', () => {
    const html = renderHtmlReport(
      report({
        executions: [
          execution({
            rawResult: { finalResult: { status: 'failed', trace: null } },
            scorers: [],
            status: 'failed',
          }),
        ],
      }),
    );
    expect(html).toContain('status-failed');
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('NaN');
  });
});

describe('escapeHtml', () => {
  it('escapes the five HTML special characters', () => {
    expect(escapeHtml('<a href="x">it\'s & ok</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;it&#39;s &amp; ok&lt;/a&gt;',
    );
  });

  it('returns input unchanged when there are no special characters', () => {
    expect(escapeHtml('plain text 123')).toBe('plain text 123');
  });
});
