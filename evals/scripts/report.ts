import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { EvalReport } from '../core/reporting';
import { renderMarkdownReport } from '../core/reporting';

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const reportsDir = resolve(repoRoot, 'evals', 'reports');
  const jsonPath = resolve(reportsDir, 'eval-report.json');
  const markdownPath = resolve(reportsDir, 'eval-report.md');
  const report = JSON.parse(await readFile(jsonPath, 'utf8')) as EvalReport;
  await writeFile(markdownPath, renderMarkdownReport(report), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Markdown report refreshed at ${markdownPath}`);
}

void main();
