import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadCases } from '../core/load-cases';
import { buildEvalReport, renderMarkdownReport } from '../core/reporting';
import { renderHtmlReport } from '../core/html-renderer';
import { evalRunnerOptionsSchema, type EvalRunnerOptions } from '../core/runner-schema';
import { buildManifestTaskInput } from '../core/task-input';
import { createPipelineRegistry } from '../pipeline';
import type { EvalCaseExecution } from '../core/case-schema';
import { computeWeightedScore } from '../core/aggregation';
import type { EvalPipelineAdapter, EvalPipelineContext, EvalPipelineResult, EvalRunArtifact } from '../pipeline/types';
import { runDefaultScorers } from '../scorers';

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const options = parseRunnerOptions(repoRoot, process.argv.slice(2));
  const allCases = await loadCases(options.casesDir);
  const cases = filterCases(allCases, options);
  const pipelines = createPipelineRegistry()
    .filter((pipeline) => options.pipelines.length === 0 || options.pipelines.includes(pipeline.name));

  const executions: EvalCaseExecution[] = [];
  for (const pipeline of pipelines) {
    for (const testCase of cases) {
      const execution = await executeCase(pipeline, testCase, {
        repoRoot,
        profile: options.profile,
        clarificationMode: options.clarificationMode,
        runtimeMode: options.runtimeMode,
      });
      executions.push(execution);
      if (options.verbose) printVerbose(execution);
    }
  }

  const report = buildEvalReport(executions, options);
  await mkdir(options.reportsDir, { recursive: true });

  const model = detectPrimaryModel(executions);
  const stamp = buildReportStamp(options.profile, model);
  const jsonContent = JSON.stringify(report, null, 2);
  const mdContent = renderMarkdownReport(report);
  const htmlContent = renderHtmlReport(report);

  const jsonPath = resolve(options.reportsDir, options.outputJsonFile);
  const markdownPath = resolve(options.reportsDir, options.outputMarkdownFile);
  const htmlPath = resolve(options.reportsDir, 'eval-report.html');
  await writeFile(jsonPath, jsonContent, 'utf8');
  await writeFile(markdownPath, mdContent, 'utf8');
  await writeFile(htmlPath, htmlContent, 'utf8');

  const stampedJson = resolve(options.reportsDir, `eval-report_${stamp}.json`);
  const stampedMd = resolve(options.reportsDir, `eval-report_${stamp}.md`);
  const stampedHtml = resolve(options.reportsDir, `eval-report_${stamp}.html`);
  await writeFile(stampedJson, jsonContent, 'utf8');
  await writeFile(stampedMd, mdContent, 'utf8');
  await writeFile(stampedHtml, htmlContent, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Eval run complete.\n  Latest: ${jsonPath}\n  Stamped: ${stampedJson}`);
}

async function executeCase(
  pipeline: EvalPipelineAdapter,
  testCase: Awaited<ReturnType<typeof loadCases>>[number],
  context: EvalPipelineContext,
): Promise<EvalCaseExecution> {
  const startedAt = new Date().toISOString();
  const skipReason = pipeline.supports(testCase);

  if (skipReason) {
    return {
      pipeline: pipeline.name,
      profile: context.profile,
      caseId: testCase.id,
      suite: testCase.suite,
      type: testCase.type,
      status: 'skipped',
      scorers: [],
      rawResult: {
        initialResult: { status: 'skipped', reason: skipReason },
        finalResult: { status: 'skipped', reason: skipReason },
      } satisfies EvalRunArtifact,
      startedAt,
      completedAt: new Date().toISOString(),
      skipReason,
    };
  }

  const initialTask = buildManifestTaskInput(testCase, context.clarificationMode);
  const initialResult = await pipeline.execute(initialTask, context);
  let resumedResult: EvalPipelineResult | undefined;
  let finalResult = initialResult;

  if (
    context.clarificationMode === 'enabled'
    && initialResult.status === 'needs_clarification'
    && Object.keys(testCase.input.clarificationAnswers).length > 0
  ) {
    const resumedTask = buildManifestTaskInput(testCase, context.clarificationMode, testCase.input.clarificationAnswers);
    resumedResult = await pipeline.execute(resumedTask, context);
    finalResult = resumedResult;
  }

  const rawResult: EvalRunArtifact = {
    initialResult,
    ...(resumedResult ? { resumedResult } : {}),
    finalResult,
  };

  return {
    pipeline: pipeline.name,
    profile: context.profile,
    caseId: testCase.id,
    suite: testCase.suite,
    type: testCase.type,
    status: finalResult.status,
    scorers: finalResult.status === 'skipped' ? [] : runDefaultScorers(testCase, rawResult),
    rawResult,
    startedAt,
    completedAt: new Date().toISOString(),
    ...(finalResult.status === 'skipped' ? { skipReason: finalResult.reason } : {}),
  };
}

function parseRunnerOptions(repoRoot: string, args: string[]): EvalRunnerOptions {
  const values: Record<string, unknown> = {
    casesDir: resolve(repoRoot, 'evals', 'cases'),
    reportsDir: resolve(repoRoot, 'evals', 'reports'),
  };

  for (const arg of args) {
    if (!arg.startsWith('--')) continue;
    const [rawKey, rawValue = ''] = arg.slice(2).split('=');
    const key = rawKey.trim();
    const value = rawValue.trim();

    if (key === 'suite') values.suites = value ? value.split(',') : [];
    else if (key === 'type') values.types = value ? value.split(',') : [];
    else if (key === 'tag') values.tags = value ? value.split(',') : [];
    else if (key === 'pipeline') values.pipelines = value ? value.split(',') : [];
    else if (key === 'case') values.caseIds = value ? value.split(',') : [];
    else if (key === 'profile') values.profile = value;
    else if (key === 'clarification-mode') values.clarificationMode = value;
    else if (key === 'runtime-mode') values.runtimeMode = value;
    else if (key === 'verbose') values.verbose = true;
    else if (key === 'reports-dir') values.reportsDir = resolve(repoRoot, value);
    else if (key === 'cases-dir') values.casesDir = resolve(repoRoot, value);
  }

  return evalRunnerOptionsSchema.parse(values);
}

function filterCases(
  cases: Awaited<ReturnType<typeof loadCases>>,
  options: EvalRunnerOptions,
) {
  return cases.filter((testCase) => {
    if (options.suites.length > 0 && !options.suites.includes(testCase.suite)) return false;
    if (options.types.length > 0 && !options.types.includes(testCase.type)) return false;
    if (options.caseIds.length > 0 && !options.caseIds.includes(testCase.id)) return false;
    if (options.tags.length > 0 && !options.tags.every((tag) => testCase.metadata.tags.includes(tag))) return false;
    return true;
  });
}

function detectPrimaryModel(executions: EvalCaseExecution[]): string {
  for (const execution of executions) {
    if (execution.status === 'skipped') continue;
    const raw = (execution.rawResult ?? {}) as Record<string, unknown>;
    const final = (raw.finalResult ?? raw) as Record<string, unknown>;
    const trace = (final.trace ?? {}) as Record<string, unknown>;
    if (typeof trace.model === 'string' && trace.model) return trace.model;
  }
  return 'unknown';
}

function sanitizeForFilename(value: string): string {
  return value.replace(/[/:@\\]/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').replace(/-+/g, '-').slice(0, 60);
}

function buildReportStamp(profile: string, model: string): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  return `${sanitizeForFilename(profile)}_${sanitizeForFilename(model)}_${ts}`;
}

function printVerbose(execution: EvalCaseExecution): void {
  const raw = (execution.rawResult ?? {}) as Record<string, unknown>;
  const final = (raw.finalResult ?? raw) as Record<string, unknown>;
  const trace = (final.trace ?? {}) as Record<string, unknown>;

  const systemPrompt = typeof trace.systemPrompt === 'string' ? trace.systemPrompt : '';
  const assembledContext = typeof trace.assembledContext === 'string' ? trace.assembledContext : '';
  const rawResponse = typeof trace.rawResponse === 'string' ? trace.rawResponse : '';
  const model = typeof trace.model === 'string' ? trace.model : '-';
  const provider = typeof trace.provider === 'string' ? trace.provider : '-';
  const inputTokens = typeof trace.inputTokens === 'number' ? trace.inputTokens : 0;
  const outputTokens = typeof trace.outputTokens === 'number' ? trace.outputTokens : 0;
  const timingMs = typeof trace.timingMs === 'number' ? trace.timingMs : 0;

  const score = execution.scorers.length > 0 ? computeWeightedScore(execution) : 0;
  const failed = execution.scorers.filter((s) => !s.passed).length;

  const trunc = (s: string, max: number) => (s.length > max ? s.slice(0, max) + '...' : s);

  const errorMsg = typeof final.error === 'string' ? final.error : '';
  const diagnostics = Array.isArray(trace.diagnostics) ? (trace.diagnostics as string[]).join('; ') : '';

  // eslint-disable-next-line no-console
  console.log([
    `\n--- ${execution.pipeline} / ${execution.caseId} [${execution.status}] ---`,
    systemPrompt ? `SYSTEM PROMPT (${systemPrompt.length} chars):\n  ${trunc(systemPrompt, 500)}` : '',
    assembledContext ? `USER MESSAGE (${assembledContext.length} chars):\n  ${trunc(assembledContext, 500)}` : '',
    rawResponse
      ? `RESPONSE (${rawResponse.length} chars, model=${model}, ${inputTokens} in / ${outputTokens} out, ${timingMs} ms):\n  ${trunc(rawResponse, 500)}`
      : `RESPONSE: (none) model=${model} provider=${provider}`,
    errorMsg ? `ERROR: ${errorMsg}` : '',
    diagnostics ? `DIAGNOSTICS: ${diagnostics}` : '',
    `Score: ${score.toFixed(2)} (${execution.scorers.length} scorers, ${failed} failed)`,
    execution.skipReason ? `Skip reason: ${execution.skipReason}` : '',
  ].filter(Boolean).join('\n'));
}

void main();
