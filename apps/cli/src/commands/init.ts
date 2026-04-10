import { resolve, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import * as fmt from '../output/format.js';
import { printHeader } from '../output/header.js';
import { theme } from '../output/theme.js';
import { runInitPrompts } from '../init/prompts.js';
import {
  generateManifestJson,
  generateClaudeMd,
  generateAddEntityCommand,
  generateValidateCommand,
  generateBootstrapCommand,
  generateBrowsePrimitivesCommand,
  generateCreatePrimitiveCommand,
  generateUpdatePrimitiveCommand,
  generateClaudeSettings,
  generateMcpConfig,
  generateGitignore,
} from '../init/templates.js';
import { getContainerRuntime } from '../utils/docker.js';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';
import { MigrationRunner } from '@ikary/cell-migration-core';
import { createRequire } from 'node:module';

function resolveMigrationsRoot(): string {
  const req = createRequire(import.meta.url);
  const pkgJson = req.resolve('@ikary/cell-runtime-core/package.json');
  return resolve(pkgJson, '..', 'migrations');
}

interface PrereqResult {
  label: string;
  ok: boolean;
  detail: string;
  required: boolean;
}

function checkPrerequisites(): PrereqResult[] {
  const results: PrereqResult[] = [];

  // Node.js >= 18
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1), 10);
  results.push({
    label: 'Node.js',
    ok: major >= 18,
    detail: major >= 18 ? nodeVersion : `${nodeVersion} — Node.js 18 or later is required`,
    required: true,
  });

  // Docker / Podman (needed for ikary local start)
  const runtime = getContainerRuntime();
  results.push({
    label: 'Docker / Podman',
    ok: runtime !== null,
    detail: runtime
      ? `${runtime} daemon running`
      : 'not found — install Docker Desktop to use ikary local start',
    required: false,
  });

  // ikary CLI globally installed (nice-to-have)
  let cliVersion: string | null = null;
  try {
    cliVersion = execSync('ikary --version', { stdio: 'pipe' }).toString().trim();
  } catch {
    // not globally installed — fine, npx works too
  }
  results.push({
    label: 'ikary CLI (global)',
    ok: cliVersion !== null,
    detail: cliVersion ?? 'not installed globally — use npx @ikary/cli <command>',
    required: false,
  });

  return results;
}

export async function initCommand(projectName?: string): Promise<void> {
  printHeader();

  try {
    // ── 1. Prerequisites ────────────────────────────────────────────────────
    fmt.section('Checking prerequisites');
    fmt.newline();

    const prereqs = checkPrerequisites();
    let hasBlocker = false;

    for (const p of prereqs) {
      if (p.ok) {
        fmt.body(`  ${theme.success('✓')} ${p.label.padEnd(22)} ${theme.muted(p.detail)}`);
      } else if (p.required) {
        fmt.body(`  ${theme.error('✗')} ${p.label.padEnd(22)} ${theme.error(p.detail)}`);
        hasBlocker = true;
      } else {
        fmt.body(`  ${theme.muted('○')} ${p.label.padEnd(22)} ${theme.muted(p.detail)}`);
      }
    }

    fmt.newline();

    if (hasBlocker) {
      fmt.error('Fix the issues above, then re-run ikary init.');
      process.exitCode = 1;
      return;
    }

    // ── 2. Prompts ──────────────────────────────────────────────────────────
    const options = await runInitPrompts(projectName);
    if (!options) return;

    const projectDir = resolve(options.name);

    if (existsSync(projectDir)) {
      fmt.error(`Directory ${theme.accent(projectDir)} already exists.`);
      process.exitCode = 1;
      return;
    }

    // ── 3. Scaffold files ───────────────────────────────────────────────────
    fmt.section('Creating project');
    fmt.newline();

    const scaffoldSpinner = fmt.createSpinner('Scaffolding files...');
    scaffoldSpinner.start();

    await mkdir(projectDir, { recursive: true });
    await mkdir(join(projectDir, '.claude', 'commands'), { recursive: true });
    await mkdir(join(projectDir, '.ikary'), { recursive: true });

    await writeFile(join(projectDir, 'manifest.json'), generateManifestJson(options), 'utf-8');
    await writeFile(join(projectDir, 'CLAUDE.md'), generateClaudeMd(options), 'utf-8');
    await writeFile(join(projectDir, '.claude', 'commands', 'ikary-add-entity.md'), generateAddEntityCommand(), 'utf-8');
    await writeFile(join(projectDir, '.claude', 'commands', 'ikary-validate.md'), generateValidateCommand(), 'utf-8');
    await writeFile(join(projectDir, '.claude', 'commands', 'ikary-bootstrap.md'), generateBootstrapCommand(), 'utf-8');
    await writeFile(join(projectDir, '.claude', 'commands', 'ikary-browse-primitives.md'), generateBrowsePrimitivesCommand(), 'utf-8');
    await writeFile(join(projectDir, '.claude', 'commands', 'ikary-create-primitive.md'), generateCreatePrimitiveCommand(), 'utf-8');
    await writeFile(join(projectDir, '.claude', 'commands', 'ikary-update-primitive.md'), generateUpdatePrimitiveCommand(), 'utf-8');
    await writeFile(join(projectDir, '.claude', 'settings.json'), generateClaudeSettings(), 'utf-8');
    await writeFile(join(projectDir, '.gitignore'), generateGitignore(), 'utf-8');

    if (options.aiTool === 'claude-code') {
      await writeFile(join(projectDir, '.mcp.json'), generateMcpConfig(), 'utf-8');
    }

    scaffoldSpinner.succeed(theme.success('Files created'));

    fmt.newline();
    fmt.body(`  ${theme.accent('manifest.json')}          Cell Manifest`);
    fmt.body(`  ${theme.accent('CLAUDE.md')}              AI context for Claude Code`);
    fmt.body(`  ${theme.accent('.gitignore')}             Excludes local.db and OS files`);
    fmt.body(`  ${theme.accent('.claude/commands/')}       /ikary-add-entity  /ikary-validate  /ikary-bootstrap`);
    fmt.body(`  ${''.padEnd(25)}  /ikary-browse-primitives  /ikary-create-primitive  /ikary-update-primitive`);
    if (options.aiTool === 'claude-code') {
      fmt.body(`  ${theme.accent('.mcp.json')}              MCP server config`);
    }

    // ── 4. Local database setup ─────────────────────────────────────────────
    fmt.newline();
    const dbSpinner = fmt.createSpinner('Setting up local database...');
    dbSpinner.start();

    const dbPath = join(projectDir, 'local.db');
    const dbUrl = `sqlite://${dbPath}`;

    try {
      const dbService = new DatabaseService(
        databaseConnectionOptionsSchema.parse({ connectionString: dbUrl }),
      );
      const runner = new MigrationRunner(dbService, {
        packageName: '@ikary/cell-runtime-core',
        migrationsRoot: resolveMigrationsRoot(),
      });
      const result = await runner.migrate();
      await dbService.destroy();

      dbSpinner.succeed(
        theme.success(
          result.applied > 0
            ? `Database ready — applied ${result.applied} migration(s) → local.db`
            : 'Database already up to date → local.db',
        ),
      );
    } catch (dbErr) {
      dbSpinner.warn(
        theme.muted(
          `Database setup skipped: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`,
        ),
      );
    }

    // ── 5. Next steps ───────────────────────────────────────────────────────
    fmt.section('Next steps');
    fmt.newline();
    fmt.body(`  ${theme.accent(`cd ${options.name}`)}`);
    fmt.newline();

    if (options.aiTool === 'claude-code') {
      fmt.body(`  ${theme.accent('claude')}                          Open Claude Code`);
      fmt.body(`  ${theme.accent('/ikary-bootstrap')}                Build your manifest step by step`);
      fmt.body(`  ${theme.accent('/ikary-add-entity')}               Add entities one at a time`);
      fmt.newline();
    } else {
      fmt.body(`  Edit ${theme.accent('manifest.json')} to define your entities`);
      fmt.newline();
    }

    fmt.body(`  ${theme.accent('ikary validate manifest.json')}     Validate the manifest`);
    fmt.body(`  ${theme.accent('ikary preview manifest.json')}      Preview in the playground`);
    fmt.newline();

    const dockerOk = prereqs.find((p) => p.label === 'Docker / Podman')?.ok;
    if (dockerOk) {
      fmt.body(`  ${theme.accent('ikary local start manifest.json')} Start the full local stack`);
      fmt.muted('  Starts the data API, preview server, and MCP server in Docker.');
    } else {
      fmt.muted('  To run the full local stack, install Docker Desktop and re-run:');
      fmt.muted(`  ${theme.accent('ikary local start manifest.json')}`);
    }

    fmt.newline();
  } catch (err) {
    fmt.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
