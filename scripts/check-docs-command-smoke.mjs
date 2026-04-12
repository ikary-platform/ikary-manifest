#!/usr/bin/env node

import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const cliBin = path.join(root, 'apps/cli/dist/cli.js');

if (!existsSync(cliBin)) {
  console.error('CLI build output not found at apps/cli/dist/cli.js. Run `pnpm run build` first.');
  process.exit(1);
}

const checks = [
  ['node', ['apps/cli/dist/cli.js', '--version']],
  ['node', ['apps/cli/dist/cli.js', 'init', '--help']],
  ['node', ['apps/cli/dist/cli.js', 'validate', '--help']],
  ['node', ['apps/cli/dist/cli.js', 'compile', '--help']],
  ['node', ['apps/cli/dist/cli.js', 'preview', '--help']],
  ['node', ['apps/cli/dist/cli.js', 'local', '--help']],
  ['node', ['apps/ikary/bin.mjs', '--version']],
];

const failures = [];

for (const [cmd, args] of checks) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    failures.push({
      command: `${cmd} ${args.join(' ')}`,
      status: result.status,
      stderr: result.stderr.trim(),
      stdout: result.stdout.trim(),
    });
  }
}

if (failures.length > 0) {
  console.error('Documentation command smoke checks failed:');
  for (const failure of failures) {
    console.error(`- ${failure.command} (exit ${failure.status})`);
    if (failure.stderr) console.error(`  stderr: ${failure.stderr}`);
    if (failure.stdout) console.error(`  stdout: ${failure.stdout}`);
  }
  process.exit(1);
}

console.log('Documentation command smoke checks passed.');
