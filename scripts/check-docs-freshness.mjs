#!/usr/bin/env node

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function walk(dir, filter) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, filter));
      continue;
    }
    if (filter(full)) out.push(full);
  }
  return out;
}

function normalizeRoute(route) {
  const [withoutHash] = route.split('#');
  const [withoutQuery] = withoutHash.split('?');
  if (withoutQuery === '/') return '/';
  return withoutQuery.endsWith('/') ? withoutQuery.slice(0, -1) : withoutQuery;
}

function hasRoutePrefix(route) {
  if (route === '/') return true;
  const prefix = route + '/';
  for (const known of docsRoutes) {
    if (known.startsWith(prefix)) return true;
  }
  return false;
}

function routeFromDocFile(file) {
  const rel = path.relative(path.join(root, 'apps/docs'), file).replaceAll('\\', '/');
  const route = '/' + rel.replace(/\.md$/, '').replace(/\/index$/, '/');
  return normalizeRoute(route);
}

const docFiles = [
  path.join(root, 'README.md'),
  path.join(root, 'apps/cli/README.md'),
  path.join(root, 'apps/ikary/README.md'),
  ...walk(path.join(root, 'apps/docs'), (f) => f.endsWith('.md')),
];

const workspacePackageNames = new Set(
  walk(path.join(root, 'apps'), (f) => f.endsWith('package.json'))
    .concat(walk(path.join(root, 'libs'), (f) => f.endsWith('package.json')))
    .map((pkgFile) => JSON.parse(readFileSync(pkgFile, 'utf8')).name)
    .filter((name) => typeof name === 'string' && name.startsWith('@ikary/')),
);

const docsRoutes = new Set(
  walk(path.join(root, 'apps/docs'), (f) => f.endsWith('.md')).map(routeFromDocFile),
);

docsRoutes.add('/');

const errors = [];

for (const file of docFiles) {
  const content = readFileSync(file, 'utf8');

  if (/\bnpx ikary\b/.test(content)) {
    errors.push(`${file}: contains forbidden install command \`npx ikary\``);
  }

  if (/\bnpm install -g ikary\b/.test(content)) {
    errors.push(`${file}: contains forbidden global install command \`npm install -g ikary\``);
  }

  if (/ikary-platform\.github\.io\/ikary-manifest/.test(content)) {
    errors.push(`${file}: still references legacy docs host ikary-platform.github.io/ikary-manifest`);
  }

  const pkgMatches = content.match(/@ikary\/[a-z0-9-]+/g) ?? [];
  for (const name of new Set(pkgMatches)) {
    if (!workspacePackageNames.has(name)) {
      errors.push(`${file}: references unknown package ${name}`);
    }
  }

  const markdownAbsoluteLinks = [...content.matchAll(/\]\((\/[^)\s]+)(?:#[^)\s]+)?\)/g)].map((m) => m[1]);
  for (const href of markdownAbsoluteLinks) {
    const normalized = normalizeRoute(href);
    if (!docsRoutes.has(normalized) && !hasRoutePrefix(normalized)) {
      errors.push(`${file}: markdown link points to missing docs route ${href}`);
    }
  }
}

const routeSourceFiles = [
  path.join(root, 'apps/docs/.vitepress/config.mts'),
  path.join(root, 'apps/docs/.vitepress/theme/IkaryFooter.vue'),
];

const ignoreLiteralRoutePrefixes = ['/brand/', '/icons/', '/favicon', '/repo'];

for (const file of routeSourceFiles) {
  const content = readFileSync(file, 'utf8');
  const literalRoutes = [...content.matchAll(/['"](\/[^'"\s]*)['"]/g)].map((m) => m[1]);

  for (const route of new Set(literalRoutes)) {
    if (ignoreLiteralRoutePrefixes.some((prefix) => route.startsWith(prefix))) continue;
    const normalized = normalizeRoute(route);
    if (!docsRoutes.has(normalized) && !hasRoutePrefix(normalized)) {
      errors.push(`${file}: route literal points to missing docs route ${route}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Documentation freshness checks failed:');
  for (const err of errors) {
    console.error(`- ${err}`);
  }
  process.exit(1);
}

console.log('Documentation freshness checks passed.');
