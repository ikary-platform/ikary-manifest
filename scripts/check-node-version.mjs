#!/usr/bin/env node
/**
 * Drift check for the repo's Node.js version pin.
 *
 * `.nvmrc` is the canonical version. This script asserts that:
 *   - the root package.json `engines.node` minimum major matches .nvmrc's major
 *   - every Dockerfile that declares `ARG NODE_VERSION=...` defaults to the
 *     same major as .nvmrc
 *
 * Patch/minor drift between .nvmrc and Dockerfile ARG defaults is allowed.
 * CI builds pass the exact value via `--build-arg NODE_VERSION=$(cat .nvmrc)`,
 * so the ARG default is only a local-dev convenience.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const errors = [];

function read(relPath) {
  return readFileSync(resolve(root, relPath), 'utf8');
}

function majorOf(version) {
  const match = version.match(/^v?(\d+)/);
  return match ? Number(match[1]) : null;
}

// ── .nvmrc (canonical) ───────────────────────────────────────────────────────
const nvmrc = read('.nvmrc').trim();
const nvmrcMajor = majorOf(nvmrc);
if (nvmrcMajor === null) {
  console.error(`[check-node-version] .nvmrc has no parseable major: "${nvmrc}"`);
  process.exit(1);
}

// ── root package.json engines.node ───────────────────────────────────────────
const pkg = JSON.parse(read('package.json'));
const enginesNode = pkg.engines?.node;
if (!enginesNode) {
  errors.push('root package.json is missing engines.node');
} else {
  const enginesMajor = majorOf(enginesNode.replace(/^[^\d]*/, ''));
  if (enginesMajor !== nvmrcMajor) {
    errors.push(
      `root package.json engines.node "${enginesNode}" (major ${enginesMajor}) does not match .nvmrc major ${nvmrcMajor}`,
    );
  }
}

// ── Dockerfile ARG NODE_VERSION defaults ─────────────────────────────────────
const dockerfiles = [
  'Dockerfile',
  'apps/cell-runtime-api/Dockerfile',
  'apps/cell-preview-server/Dockerfile',
  'apps/try-api/Dockerfile',
];

for (const file of dockerfiles) {
  let contents;
  try {
    contents = read(file);
  } catch {
    continue; // Dockerfile removed or not yet written
  }
  const argMatch = contents.match(/^\s*ARG\s+NODE_VERSION\s*=\s*(\S+)/m);
  if (!argMatch) {
    errors.push(`${file} does not declare ARG NODE_VERSION=<version>`);
    continue;
  }
  const argMajor = majorOf(argMatch[1]);
  if (argMajor !== nvmrcMajor) {
    errors.push(
      `${file} ARG NODE_VERSION="${argMatch[1]}" (major ${argMajor}) does not match .nvmrc major ${nvmrcMajor}`,
    );
  }
  const fromMatch = contents.match(/^FROM\s+node:(?!\$)/m);
  if (fromMatch) {
    errors.push(
      `${file} has a literal FROM node:... line; switch to FROM node:\${NODE_VERSION}-... so the ARG takes effect`,
    );
  }
}

if (errors.length > 0) {
  console.error('[check-node-version] drift detected:');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n.nvmrc = ${nvmrc}`);
  console.error('Fix the mismatches above or update .nvmrc.');
  process.exit(1);
}

console.log(`[check-node-version] ok — .nvmrc ${nvmrc}, engines.node ${enginesNode}`);
