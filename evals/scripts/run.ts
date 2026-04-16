import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadCases } from '../core/load-cases';
import { buildEvalReport, renderMarkdownReport } from '../core/reporting';
import { evalRunnerOptionsSchema, type EvalRunnerOptions } from '../core/runner-schema';
import { buildManifestTaskInput } from '../core/task-input';
import { createPipelineRegistry } from '../pipeline';
import type { EvalCaseExecution } from '../core/case-schema';
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
      executions.push(await executeCase(pipeline, testCase, {
        repoRoot,
        profile: options.profile,
        clarificationMode: options.clarificationMode,
        runtimeMode: options.runtimeMode,
      }));
    }
  }

  const report = buildEvalReport(executions, options);
  await mkdir(options.reportsDir, { recursive: true });
  const jsonPath = resolve(options.reportsDir, options.outputJsonFile);
  const markdownPath = resolve(options.reportsDir, options.outputMarkdownFile);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  await writeFile(markdownPath, renderMarkdownReport(report), 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Eval run complete. JSON: ${jsonPath} | Markdown: ${markdownPath}`);
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

void main();
