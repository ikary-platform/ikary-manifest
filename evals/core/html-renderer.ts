import type { EvalDimensionSummary, EvalReport, EvalScorerSummary } from './reporting';
import type { EvalCaseExecution, ScorerResult } from './case-schema';
import { computeWeightedScore } from './aggregation';
import { DEFAULT_SCORER_WEIGHTS } from './weights';

export function renderHtmlReport(report: EvalReport): string {
  const cases = report.executions.map((execution, index) => buildCaseView(execution, index));
  const sortedAggregations = sortAggregationsForDisplay(report);
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    renderHead(report),
    '<body>',
    renderHeader(report),
    '<main>',
    renderAggregationsSection(sortedAggregations),
    renderScorersSection(report.byScorer),
    renderOperationalSection(report),
    renderFailureReasonsSection(report),
    renderWorstCasesSection(report, cases),
    renderCasesSection(cases),
    '</main>',
    renderScript(),
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

interface CaseView {
  readonly index: number;
  readonly anchorId: string;
  readonly execution: EvalCaseExecution;
  readonly trace: TraceShape;
  readonly weightedScore: number;
}

interface TraceShape {
  readonly model: string;
  readonly provider: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly timingMs: number;
  readonly contextSummary: string;
  readonly assembledContext: string;
  readonly systemPrompt: string;
  readonly rawResponse: string;
  readonly diagnostics: string[];
  readonly retrievalHits: Array<{ id: string; type: string; title: string; summary?: string; source?: string; score?: number }>;
  readonly policyDecisions: string[];
  readonly assumptions: string[];
  readonly validation: Array<{ stage: string; passed: boolean; errors: string[] }>;
}

function buildCaseView(execution: EvalCaseExecution, index: number): CaseView {
  const trace = readTrace(execution.rawResult);
  const weightedScore = execution.scorers.length > 0 ? computeWeightedScore(execution) : 0;
  const anchorId = `case-${index}-${slugify(`${execution.pipeline}-${execution.caseId}`)}`;
  return { index, anchorId, execution, trace, weightedScore };
}

function readTrace(rawResult: unknown): TraceShape {
  const raw = (rawResult ?? {}) as Record<string, unknown>;
  const final = (raw.finalResult ?? raw) as Record<string, unknown>;
  const trace = (final.trace ?? {}) as Record<string, unknown>;
  return {
    model: typeof trace.model === 'string' ? trace.model : '',
    provider: typeof trace.provider === 'string' ? trace.provider : '',
    inputTokens: numberOr(trace.inputTokens, 0),
    outputTokens: numberOr(trace.outputTokens, 0),
    timingMs: numberOr(trace.timingMs, 0),
    contextSummary: typeof trace.contextSummary === 'string' ? trace.contextSummary : '',
    assembledContext: typeof trace.assembledContext === 'string' ? trace.assembledContext : '',
    systemPrompt: typeof trace.systemPrompt === 'string' ? trace.systemPrompt : '',
    rawResponse: typeof trace.rawResponse === 'string' ? trace.rawResponse : '',
    diagnostics: arrayOfStrings(trace.diagnostics),
    retrievalHits: arrayOfRetrievalHits(trace.retrievalHits),
    policyDecisions: arrayOfStrings(trace.policyDecisions),
    assumptions: arrayOfStrings(trace.assumptions),
    validation: arrayOfValidation(trace.validation),
  };
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function arrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function arrayOfRetrievalHits(value: unknown): TraceShape['retrievalHits'] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : '',
      type: typeof item.type === 'string' ? item.type : '',
      title: typeof item.title === 'string' ? item.title : '',
      summary: typeof item.summary === 'string' ? item.summary : undefined,
      source: typeof item.source === 'string' ? item.source : undefined,
      score: typeof item.score === 'number' ? item.score : undefined,
    }));
}

function arrayOfValidation(value: unknown): TraceShape['validation'] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      stage: typeof item.stage === 'string' ? item.stage : '',
      passed: item.passed === true,
      errors: arrayOfStrings(item.errors),
    }));
}

function sortAggregationsForDisplay(report: EvalReport) {
  return {
    pipelines: [...report.byPipeline].sort((a, b) => a.key.localeCompare(b.key)),
    suites: [...report.bySuite].sort((a, b) => a.key.localeCompare(b.key)),
    taskFamilies: [...report.byTaskFamily].sort((a, b) => a.key.localeCompare(b.key)),
  };
}

function renderHead(report: EvalReport): string {
  return [
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(`IKARY Eval Report - ${report.generatedAt}`)}</title>`,
    `<style>${STYLES}</style>`,
    '</head>',
  ].join('\n');
}

function renderHeader(report: EvalReport): string {
  const stats = [
    { value: String(report.summary.totalCases), label: 'Total' },
    { value: String(report.summary.completedCases), label: 'Completed' },
    { value: String(report.summary.failedCases), label: 'Failed' },
    { value: String(report.summary.skippedCases), label: 'Skipped' },
    { value: formatScore(report.summary.averageScore), label: 'Avg score' },
    { value: formatPct(report.summary.passRate), label: 'Pass rate' },
  ];
  const statHtml = stats
    .map(
      (s) =>
        `<div class="stat"><span class="stat-value">${escapeHtml(s.value)}</span><span class="stat-label">${escapeHtml(s.label)}</span></div>`,
    )
    .join('');
  return [
    '<header class="page-header">',
    '<div class="page-header-row">',
    '<h1>IKARY Eval Report</h1>',
    `<span class="profile-chip">Profile: ${escapeHtml(report.profile)}</span>`,
    `<span class="generated">Generated ${escapeHtml(report.generatedAt)}</span>`,
    '</div>',
    `<div class="headline-stats">${statHtml}</div>`,
    '</header>',
  ].join('\n');
}

function renderAggregationsSection(grouped: ReturnType<typeof sortAggregationsForDisplay>): string {
  return [
    '<section class="card">',
    '<h2>By pipeline</h2>',
    renderDimensionTable(grouped.pipelines),
    '<h2>By suite</h2>',
    renderDimensionTable(grouped.suites),
    '<h2>By task family</h2>',
    renderDimensionTable(grouped.taskFamilies),
    '</section>',
  ].join('\n');
}

function renderDimensionTable(rows: EvalDimensionSummary[]): string {
  if (rows.length === 0) return '<p class="empty">No data.</p>';
  const body = rows
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.key)}</td>
        <td class="num">${row.totalCases}</td>
        <td class="num">${row.completedCases}</td>
        <td class="num">${row.failedCases}</td>
        <td class="num">${row.clarificationCases}</td>
        <td class="num">${row.skippedCases}</td>
        <td class="num">${formatScore(row.averageScore)} ${renderBar(row.averageScore)}</td>
        <td class="num">${formatPct(row.passRate)} ${renderBar(row.passRate)}</td>
      </tr>`,
    )
    .join('');
  return `
    <table class="agg-table">
      <thead>
        <tr>
          <th>Key</th>
          <th>Total</th>
          <th>Completed</th>
          <th>Failed</th>
          <th>Clarification</th>
          <th>Skipped</th>
          <th>Avg score</th>
          <th>Pass rate</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;
}

function renderScorersSection(scorers: EvalScorerSummary[]): string {
  if (scorers.length === 0) {
    return '<section class="card"><h2>Scorers</h2><p class="empty">No scorers reported.</p></section>';
  }
  const body = scorers
    .map((row) => {
      const weight = DEFAULT_SCORER_WEIGHTS[row.scorer] ?? 1;
      return `
        <tr>
          <td>${escapeHtml(row.scorer)}</td>
          <td class="num">${weight}</td>
          <td class="num">${formatScore(row.averageScore)} ${renderBar(row.averageScore)}</td>
          <td class="num">${formatPct(row.passRate)} ${renderBar(row.passRate)}</td>
          <td class="num">${row.failures}</td>
        </tr>`;
    })
    .join('');
  return `
    <section class="card">
      <h2>By scorer</h2>
      <table class="agg-table">
        <thead>
          <tr>
            <th>Scorer</th>
            <th>Weight</th>
            <th>Avg score</th>
            <th>Pass rate</th>
            <th>Failures</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </section>`;
}

function renderOperationalSection(report: EvalReport): string {
  const items = [
    { label: 'Avg latency', value: `${Math.round(report.latency.averageMs)} ms` },
    { label: 'Max latency', value: `${Math.round(report.latency.maxMs)} ms` },
    { label: 'Total cost', value: `$${report.cost.totalUsd.toFixed(4)}` },
    { label: 'Input tokens', value: String(report.cost.totalInputTokens) },
    { label: 'Output tokens', value: String(report.cost.totalOutputTokens) },
    { label: 'Avg retrieval hits', value: report.retrievalStats.averageHits.toFixed(2) },
    { label: 'Cases with hits', value: String(report.retrievalStats.casesWithHits) },
    { label: 'Avg context chars', value: String(Math.round(report.retrievalStats.averageContextChars)) },
    { label: 'Clarification asked', value: String(report.clarificationStats.askedCases) },
    { label: 'Clarification resumed', value: String(report.clarificationStats.resumedCases) },
    { label: 'Clarification successful', value: String(report.clarificationStats.successfulAfterClarification) },
  ];
  const html = items
    .map(
      (item) =>
        `<div class="stat"><span class="stat-value">${escapeHtml(item.value)}</span><span class="stat-label">${escapeHtml(item.label)}</span></div>`,
    )
    .join('');
  return `
    <section class="card">
      <h2>Operational</h2>
      <div class="stats-grid">${html}</div>
    </section>`;
}

function renderFailureReasonsSection(report: EvalReport): string {
  if (report.commonFailureReasons.length === 0) {
    return '<section class="card"><h2>Common failure reasons</h2><p class="empty">No failures recorded.</p></section>';
  }
  const body = report.commonFailureReasons
    .map((row) => `<li><span class="count-pill">${row.count}</span> ${escapeHtml(row.reason)}</li>`)
    .join('');
  return `
    <section class="card">
      <h2>Common failure reasons</h2>
      <ol class="failure-list">${body}</ol>
    </section>`;
}

function renderWorstCasesSection(report: EvalReport, cases: CaseView[]): string {
  if (report.worstCases.length === 0) {
    return '<section class="card"><h2>Worst cases</h2><p class="empty">No cases scored.</p></section>';
  }
  const anchorByKey = new Map(cases.map((view) => [`${view.execution.pipeline}::${view.execution.caseId}`, view.anchorId]));
  const body = report.worstCases
    .map((row) => {
      const anchor = anchorByKey.get(`${row.pipeline}::${row.caseId}`);
      const label = `${row.pipeline} / ${row.caseId}`;
      const link = anchor ? `<a href="#${escapeHtml(anchor)}">${escapeHtml(label)}</a>` : escapeHtml(label);
      const diag = row.diagnostics.slice(0, 2).map(escapeHtml).join('<br>');
      return `
        <tr>
          <td>${link}</td>
          <td><span class="status-badge status-${escapeHtml(row.status)}">${escapeHtml(row.status)}</span></td>
          <td class="num">${formatScore(row.averageScore)} ${renderBar(row.averageScore)}</td>
          <td>${diag}</td>
        </tr>`;
    })
    .join('');
  return `
    <section class="card">
      <h2>Worst cases</h2>
      <table class="agg-table">
        <thead>
          <tr>
            <th>Case</th>
            <th>Status</th>
            <th>Weighted score</th>
            <th>Diagnostics</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </section>`;
}

function renderCasesSection(cases: CaseView[]): string {
  if (cases.length === 0) {
    return '<section class="card cases"><h2>Case executions</h2><p class="empty">No cases executed.</p></section>';
  }

  const pipelines = uniqueSorted(cases.map((view) => view.execution.pipeline));
  const suites = uniqueSorted(cases.map((view) => view.execution.suite));

  const pipelineOptions = pipelines
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join('');
  const suiteOptions = suites
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join('');

  const list = cases.map(renderCaseDetail).join('\n');

  return `
    <section class="card cases">
      <h2>Case executions <span class="count-pill">${cases.length}</span></h2>
      <div class="filters">
        <input type="search" id="filter-text" placeholder="Filter by id, model, diagnostic">
        <select id="filter-status">
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="needs_clarification">Needs clarification</option>
          <option value="skipped">Skipped</option>
        </select>
        <select id="filter-pipeline">
          <option value="">All pipelines</option>
          ${pipelineOptions}
        </select>
        <select id="filter-suite">
          <option value="">All suites</option>
          ${suiteOptions}
        </select>
        <select id="sort-by">
          <option value="score-asc">Sort: score (low first)</option>
          <option value="score-desc">Sort: score (high first)</option>
          <option value="latency-desc">Sort: latency (slow first)</option>
          <option value="default">Sort: default order</option>
        </select>
        <span class="visible-count" id="visible-count">${cases.length} of ${cases.length}</span>
      </div>
      <ol class="case-list" id="case-list">${list}</ol>
    </section>`;
}

function renderCaseDetail(view: CaseView): string {
  const { execution, trace, weightedScore, anchorId } = view;
  const status = execution.status;
  const searchHaystack = [
    execution.pipeline,
    execution.caseId,
    execution.suite,
    execution.type,
    trace.model,
    trace.provider,
    ...trace.diagnostics,
    ...execution.scorers.flatMap((s) => s.diagnostics),
    execution.skipReason ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const tokenSummary = trace.inputTokens || trace.outputTokens
    ? `${trace.inputTokens} in / ${trace.outputTokens} out`
    : '-';
  const latencyDisplay = trace.timingMs ? `${trace.timingMs} ms` : '-';

  const traceList = renderTraceList(trace, execution);
  const scorers = renderScorersTable(execution.scorers);
  const retrieval = renderRetrievalList(trace.retrievalHits);
  const validation = renderValidationList(trace.validation);
  const policies = renderStringList('Policy decisions', trace.policyDecisions);
  const assumptions = renderStringList('Assumptions', trace.assumptions);
  const diagnostics = renderStringList('Trace diagnostics', trace.diagnostics);
  const skipBlock = execution.skipReason
    ? `<div class="skip-reason"><strong>Skipped:</strong> ${escapeHtml(execution.skipReason)}</div>`
    : '';
  const systemPromptBlock = trace.systemPrompt
    ? `<details class="nested"><summary>System prompt (${trace.systemPrompt.length} chars)</summary><pre>${escapeHtml(trace.systemPrompt)}</pre></details>`
    : '';
  const contextBlock = trace.assembledContext
    ? `<details class="nested"><summary>Assembled context (${trace.assembledContext.length} chars)</summary><pre>${escapeHtml(trace.assembledContext)}</pre></details>`
    : '';
  const rawResponseBlock = trace.rawResponse
    ? `<details class="nested"><summary>Raw response (${trace.rawResponse.length} chars)</summary><pre>${escapeHtml(trace.rawResponse)}</pre></details>`
    : '';

  return `
    <li>
      <details id="${escapeHtml(anchorId)}" class="case status-${escapeHtml(status)}"
        data-status="${escapeHtml(status)}"
        data-pipeline="${escapeHtml(execution.pipeline)}"
        data-suite="${escapeHtml(execution.suite)}"
        data-type="${escapeHtml(execution.type)}"
        data-score="${weightedScore.toFixed(4)}"
        data-latency="${trace.timingMs}"
        data-search="${escapeHtml(searchHaystack)}"
        data-index="${view.index}">
        <summary>
          <span class="status-badge status-${escapeHtml(status)}">${escapeHtml(status)}</span>
          <span class="case-id">${escapeHtml(execution.pipeline)} / ${escapeHtml(execution.suite)} / ${escapeHtml(execution.caseId)}</span>
          <span class="case-model">${escapeHtml(trace.model || '-')}</span>
          <span class="case-score score-${scoreBucket(weightedScore)}">${formatScore(weightedScore)}</span>
          <span class="case-latency">${escapeHtml(latencyDisplay)}</span>
          <span class="case-tokens">${escapeHtml(tokenSummary)}</span>
        </summary>
        <div class="case-detail">
          ${skipBlock}
          ${traceList}
          ${scorers}
          ${validation}
          ${retrieval}
          ${policies}
          ${assumptions}
          ${diagnostics}
          ${systemPromptBlock}
          ${contextBlock}
          ${rawResponseBlock}
        </div>
      </details>
    </li>`;
}

function renderTraceList(trace: TraceShape, execution: EvalCaseExecution): string {
  const rows: Array<[string, string]> = [
    ['Provider', trace.provider || '-'],
    ['Model', trace.model || '-'],
    ['Latency', trace.timingMs ? `${trace.timingMs} ms` : '-'],
    ['Input tokens', String(trace.inputTokens)],
    ['Output tokens', String(trace.outputTokens)],
    ['Started', execution.startedAt],
    ['Completed', execution.completedAt],
    ['Context summary', trace.contextSummary || '-'],
  ];
  const body = rows
    .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`)
    .join('');
  return `<dl class="trace">${body}</dl>`;
}

function renderScorersTable(scorers: ScorerResult[]): string {
  if (scorers.length === 0) return '';
  const sorted = [...scorers].sort((a, b) => Number(a.passed) - Number(b.passed));
  const body = sorted
    .map((s) => {
      const weight = DEFAULT_SCORER_WEIGHTS[s.scorer] ?? 1;
      const diag = s.diagnostics.length > 0
        ? s.diagnostics.map((d) => `<div class="diag">${escapeHtml(d)}</div>`).join('')
        : '<span class="muted">no diagnostics</span>';
      return `
        <tr>
          <td>${escapeHtml(s.scorer)}</td>
          <td class="num">${weight}</td>
          <td class="num">${formatScore(s.score)} ${renderBar(s.score)}</td>
          <td><span class="status-badge ${s.passed ? 'status-completed' : 'status-failed'}">${s.passed ? 'pass' : 'fail'}</span></td>
          <td>${diag}</td>
        </tr>`;
    })
    .join('');
  return `
    <details class="nested" open>
      <summary>Scorers (${scorers.length})</summary>
      <table class="scorer-table">
        <thead>
          <tr><th>Scorer</th><th>Weight</th><th>Score</th><th>Result</th><th>Diagnostics</th></tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </details>`;
}

function renderRetrievalList(hits: TraceShape['retrievalHits']): string {
  if (hits.length === 0) return '';
  const body = hits
    .map(
      (h) => `
        <li>
          <span class="hit-title">${escapeHtml(h.title || h.id)}</span>
          ${h.type ? `<span class="muted">(${escapeHtml(h.type)})</span>` : ''}
          ${typeof h.score === 'number' ? `<span class="muted">score=${h.score.toFixed(2)}</span>` : ''}
          ${h.summary ? `<div class="hit-summary">${escapeHtml(h.summary)}</div>` : ''}
        </li>`,
    )
    .join('');
  return `
    <details class="nested">
      <summary>Retrieval hits (${hits.length})</summary>
      <ul class="hit-list">${body}</ul>
    </details>`;
}

function renderValidationList(stages: TraceShape['validation']): string {
  if (stages.length === 0) return '';
  const body = stages
    .map((stage) => {
      const errs = stage.errors.length > 0
        ? stage.errors.map((e) => `<div class="diag">${escapeHtml(e)}</div>`).join('')
        : '<span class="muted">no errors</span>';
      return `
        <tr>
          <td>${escapeHtml(stage.stage)}</td>
          <td><span class="status-badge ${stage.passed ? 'status-completed' : 'status-failed'}">${stage.passed ? 'pass' : 'fail'}</span></td>
          <td>${errs}</td>
        </tr>`;
    })
    .join('');
  return `
    <details class="nested">
      <summary>Validation (${stages.length})</summary>
      <table class="scorer-table">
        <thead><tr><th>Stage</th><th>Result</th><th>Errors</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
    </details>`;
}

function renderStringList(label: string, items: string[]): string {
  if (items.length === 0) return '';
  const body = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `
    <details class="nested">
      <summary>${escapeHtml(label)} (${items.length})</summary>
      <ul>${body}</ul>
    </details>`;
}

function renderScript(): string {
  return `<script>${SCRIPT}</script>`;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function scoreBucket(score: number): 'pass' | 'warn' | 'fail' {
  if (score >= 0.9) return 'pass';
  if (score >= 0.5) return 'warn';
  return 'fail';
}

function formatScore(score: number): string {
  return score.toFixed(2);
}

function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function renderBar(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  const pct = Math.round(clamped * 100);
  const bucket = scoreBucket(clamped);
  return `<span class="bar bar-${bucket}"><span class="bar-fill" style="width:${pct}%"></span></span>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const STYLES = `
  :root {
    color-scheme: light;
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --pass: #16a34a;
    --warn: #d97706;
    --fail: #dc2626;
    --skip: #94a3b8;
    --bar-bg: #e2e8f0;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font: 14px/1.5 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--text);
    background: var(--bg);
  }
  h1, h2 { margin: 0 0 0.5rem; font-weight: 600; }
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.05rem; margin-top: 1.25rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  pre { font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: #f1f5f9; padding: 0.75rem; border-radius: 6px; overflow: auto; max-height: 400px; }
  code, .case-model, .case-id { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
  main { max-width: 1100px; margin: 0 auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
  .page-header {
    background: var(--card);
    border-bottom: 1px solid var(--border);
    padding: 1rem;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .page-header-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.75rem; max-width: 1100px; margin: 0 auto; }
  .profile-chip { background: #e0e7ff; color: #3730a3; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 600; }
  .generated { color: var(--muted); font-size: 12px; }
  .headline-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; max-width: 1100px; margin: 0.75rem auto 0; }
  .stat { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; }
  .stat-value { font-size: 1.25rem; font-weight: 600; }
  .stat-label { color: var(--muted); font-size: 12px; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 1rem 1.25rem; }
  .card h2:first-child { margin-top: 0; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.5rem; }
  .agg-table, .scorer-table { width: 100%; border-collapse: collapse; margin-bottom: 0.5rem; }
  .agg-table th, .agg-table td, .scorer-table th, .scorer-table td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
  .agg-table th, .scorer-table th { color: var(--muted); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
  .num { text-align: right; white-space: nowrap; }
  .bar { display: inline-block; width: 60px; height: 8px; background: var(--bar-bg); border-radius: 4px; vertical-align: middle; overflow: hidden; margin-left: 6px; }
  .bar-fill { display: block; height: 100%; }
  .bar-pass .bar-fill { background: var(--pass); }
  .bar-warn .bar-fill { background: var(--warn); }
  .bar-fail .bar-fill { background: var(--fail); }
  .status-badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #fff; }
  .status-completed { background: var(--pass); }
  .status-failed { background: var(--fail); }
  .status-needs_clarification { background: var(--warn); }
  .status-skipped { background: var(--skip); }
  .case-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
  .case { background: #fafbfd; border: 1px solid var(--border); border-radius: 8px; padding: 0; }
  .case[hidden] { display: none; }
  .case > summary { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; list-style: none; }
  .case > summary::-webkit-details-marker { display: none; }
  .case > summary::before { content: "+"; display: inline-block; width: 14px; color: var(--muted); }
  .case[open] > summary::before { content: "-"; }
  .case-id { font-size: 13px; }
  .case-model { color: var(--muted); font-size: 12px; }
  .case-score { font-weight: 600; margin-left: auto; }
  .score-pass { color: var(--pass); }
  .score-warn { color: var(--warn); }
  .score-fail { color: var(--fail); }
  .case-latency, .case-tokens { color: var(--muted); font-size: 12px; }
  .case-detail { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  .case-detail dl.trace { display: grid; grid-template-columns: max-content 1fr; gap: 2px 12px; margin: 0; padding: 8px 12px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; }
  .case-detail dl.trace dt { color: var(--muted); }
  .case-detail dl.trace dd { margin: 0; word-break: break-word; }
  details.nested { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 6px 12px; }
  details.nested[open] { padding-bottom: 12px; }
  details.nested > summary { cursor: pointer; color: var(--text); font-weight: 600; }
  .filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 8px; }
  .filters input, .filters select { font: inherit; padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px; background: #fff; }
  .filters input { flex: 1; min-width: 200px; }
  .visible-count { color: var(--muted); font-size: 12px; margin-left: auto; }
  .count-pill { background: #e2e8f0; border-radius: 999px; padding: 1px 8px; font-size: 12px; color: var(--muted); margin-left: 6px; }
  .empty, .muted { color: var(--muted); font-size: 12px; }
  .diag { font-size: 12px; color: var(--text); margin-bottom: 2px; }
  .skip-reason { background: #fff7ed; border: 1px solid #fed7aa; padding: 6px 12px; border-radius: 6px; color: #9a3412; }
  .failure-list { padding-left: 1rem; }
  .failure-list li { margin-bottom: 4px; }
  .hit-list { padding-left: 1rem; }
  .hit-list li { margin-bottom: 6px; }
  .hit-title { font-weight: 600; }
  .hit-summary { color: var(--muted); font-size: 12px; }
  a { color: #2563eb; }
`;

const SCRIPT = `
  (function () {
    var list = document.getElementById('case-list');
    if (!list) return;
    var cases = Array.prototype.slice.call(list.querySelectorAll('.case'));
    var originalOrder = cases.slice();
    var filterText = document.getElementById('filter-text');
    var filterStatus = document.getElementById('filter-status');
    var filterPipeline = document.getElementById('filter-pipeline');
    var filterSuite = document.getElementById('filter-suite');
    var sortBy = document.getElementById('sort-by');
    var visibleCount = document.getElementById('visible-count');
    var totalCount = cases.length;

    function applyFilters() {
      var text = (filterText.value || '').trim().toLowerCase();
      var status = filterStatus.value;
      var pipeline = filterPipeline.value;
      var suite = filterSuite.value;
      var visible = 0;
      for (var i = 0; i < cases.length; i++) {
        var node = cases[i];
        var hay = node.getAttribute('data-search') || '';
        var ok = true;
        if (text && hay.indexOf(text) === -1) ok = false;
        if (status && node.getAttribute('data-status') !== status) ok = false;
        if (pipeline && node.getAttribute('data-pipeline') !== pipeline) ok = false;
        if (suite && node.getAttribute('data-suite') !== suite) ok = false;
        var li = node.parentElement;
        if (ok) {
          li.removeAttribute('hidden');
          visible++;
        } else {
          li.setAttribute('hidden', '');
        }
      }
      visibleCount.textContent = visible + ' of ' + totalCount;
    }

    function applySort() {
      var mode = sortBy.value;
      var sorted;
      if (mode === 'default') {
        sorted = originalOrder.slice();
      } else if (mode === 'latency-desc') {
        sorted = cases.slice().sort(function (a, b) {
          return parseFloat(b.getAttribute('data-latency') || '0') - parseFloat(a.getAttribute('data-latency') || '0');
        });
      } else if (mode === 'score-desc') {
        sorted = cases.slice().sort(function (a, b) {
          return parseFloat(b.getAttribute('data-score') || '0') - parseFloat(a.getAttribute('data-score') || '0');
        });
      } else {
        sorted = cases.slice().sort(function (a, b) {
          return parseFloat(a.getAttribute('data-score') || '0') - parseFloat(b.getAttribute('data-score') || '0');
        });
      }
      for (var i = 0; i < sorted.length; i++) {
        list.appendChild(sorted[i].parentElement);
      }
    }

    [filterText, filterStatus, filterPipeline, filterSuite].forEach(function (el) {
      if (el) el.addEventListener('input', applyFilters);
    });
    if (sortBy) sortBy.addEventListener('change', applySort);
    applySort();
    applyFilters();
  })();
`;
