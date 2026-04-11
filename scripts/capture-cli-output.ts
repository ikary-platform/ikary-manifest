/**
 * Generates docs/snippets/cli/*.txt from actual CLI output.
 *
 * Run: pnpm capture-cli-output
 *
 * Re-run this script whenever the CLI output format changes and commit
 * the updated snippet files alongside the CLI change.
 */

import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const snippetsDir = join(root, 'apps', 'docs', 'snippets', 'cli');
const cli = join(root, 'apps', 'cli', 'dist', 'cli.js');

// Build the CLI if the dist artifact is missing
if (!existsSync(cli)) {
  console.log('CLI dist not found — building @ikary/cli first...\n');
  execSync('pnpm --filter @ikary/cli build', { cwd: root, stdio: 'inherit' });
}

mkdirSync(snippetsDir, { recursive: true });

function run(args: string): string {
  try {
    return execSync(`node "${cli}" ${args} 2>&1`, {
      cwd: root,
      encoding: 'utf-8',
    })
      // Strip ANSI color codes
      .replace(/\x1B\[[0-9;]*[mGKHF]/g, '')
      // Normalize the absolute path prefix to a relative one for portability
      .replace(new RegExp(root.replace(/[/\\]/g, '[/\\\\]') + '[/\\\\]?', 'g'), '');
  } catch (err: any) {
    // Non-zero exit (validation errors) — capture stdout from the error
    return (err.stdout as string)
      .replace(/\x1B\[[0-9;]*[mGKHF]/g, '')
      .replace(new RegExp(root.replace(/[/\\]/g, '[/\\\\]') + '[/\\\\]?', 'g'), '');
  }
}

function write(name: string, content: string): void {
  const path = join(snippetsDir, name);
  writeFileSync(path, content.trimEnd() + '\n', 'utf-8');
  console.log(`  wrote ${name}`);
}

console.log('Capturing CLI output snippets...\n');

// validate — success
write('validate-success.txt', run('validate manifests/examples/minimal-manifest.yaml'));

// validate — error
write('validate-error.txt', run('validate apps/docs/fixtures/invalid.json'));

// compile — stdout (first 25 lines)
const compileOut = run('compile manifests/examples/minimal-manifest.yaml --stdout');
const compileLines = compileOut.split('\n').slice(0, 25).join('\n');
write('compile-stdout.txt', compileLines + '\n...');

console.log('\nDone. Commit the updated files in docs/snippets/cli/ alongside any CLI output changes.');
