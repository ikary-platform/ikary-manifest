import { join } from 'node:path';
import { PORTS } from '../utils/ports.js';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync, readFileSync as readFileSyncNode } from 'node:fs';
import * as fmt from '../output/format.js';
import { theme } from '../output/theme.js';
import {
  generateClaudeMd,
  generateAddEntityCommand,
  generateValidateCommand,
  generateBootstrapCommand,
  generateBrowsePrimitivesCommand,
  generateCreatePrimitiveCommand,
  generateUpdatePrimitiveCommand,
  generateClaudeSettings,
  generateMcpConfig,
} from '../init/templates.js';

interface FileResult {
  path: string;
  label: string;
  description: string;
  status: 'created' | 'updated' | 'skipped';
}

async function writeIfChanged(
  filePath: string,
  content: string,
  force: boolean,
): Promise<'created' | 'updated' | 'skipped'> {
  if (existsSync(filePath)) {
    if (!force) return 'skipped';
    const existing = await readFile(filePath, 'utf-8');
    if (existing === content) return 'skipped';
    await writeFile(filePath, content, 'utf-8');
    return 'updated';
  }
  await writeFile(filePath, content, 'utf-8');
  return 'created';
}

function detectProjectName(cwd: string): string {
  try {
    const pkgPath = join(cwd, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSyncNode(pkgPath, 'utf-8'));
      if (typeof pkg.name === 'string') return pkg.name;
    }
  } catch {
    // ignore
  }
  return cwd.split('/').at(-1) ?? 'My Project';
}

async function checkLocalStack(): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${PORTS.MCP_SERVER}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function setupAiCommand(options: {
  local?: boolean;
  force?: boolean;
}): Promise<void> {
  const cwd = process.cwd();
  const mcpUrl = options.local ? `http://localhost:${PORTS.MCP_SERVER}/mcp` : 'https://public.ikary.co/mcp';

  fmt.section('Setting up Claude Code integration');
  fmt.newline();

  // ── Warn if --local but stack not running ──────────────────────────────
  if (options.local) {
    const stackRunning = await checkLocalStack();
    if (!stackRunning) {
      fmt.body(
        `  ${theme.muted('○')} Local MCP server is not running — files will be written with`,
      );
      fmt.body(
        `    ${theme.muted(`http://localhost:${PORTS.MCP_SERVER}/mcp`)} but start the stack first:`,
      );
      fmt.body(`    ${theme.accent('ikary local start <manifest>')}`);
      fmt.newline();
    }
  }

  // ── Scaffold ───────────────────────────────────────────────────────────
  await mkdir(join(cwd, '.claude', 'commands'), { recursive: true });

  const projectName = detectProjectName(cwd);

  const claudeMdContent = generateClaudeMd({ name: projectName, description: '', aiTool: 'claude-code', appType: 'blank' });

  const files: Array<{ filePath: string; content: string; label: string; description: string }> = [
    {
      filePath: join(cwd, '.claude', 'commands', 'ikary-add-entity.md'),
      content: generateAddEntityCommand(),
      label: '.claude/commands/ikary-add-entity.md',
      description: '/ikary-add-entity — scaffold a new entity',
    },
    {
      filePath: join(cwd, '.claude', 'commands', 'ikary-validate.md'),
      content: generateValidateCommand(),
      label: '.claude/commands/ikary-validate.md',
      description: '/ikary-validate — validate the manifest',
    },
    {
      filePath: join(cwd, '.claude', 'commands', 'ikary-bootstrap.md'),
      content: generateBootstrapCommand(),
      label: '.claude/commands/ikary-bootstrap.md',
      description: '/ikary-bootstrap — build manifest step by step',
    },
    {
      filePath: join(cwd, '.claude', 'commands', 'ikary-browse-primitives.md'),
      content: generateBrowsePrimitivesCommand(),
      label: '.claude/commands/ikary-browse-primitives.md',
      description: '/ikary-browse-primitives — explore the UI catalog',
    },
    {
      filePath: join(cwd, '.claude', 'commands', 'ikary-create-primitive.md'),
      content: generateCreatePrimitiveCommand(),
      label: '.claude/commands/ikary-create-primitive.md',
      description: '/ikary-create-primitive — scaffold + build a custom primitive',
    },
    {
      filePath: join(cwd, '.claude', 'commands', 'ikary-update-primitive.md'),
      content: generateUpdatePrimitiveCommand(),
      label: '.claude/commands/ikary-update-primitive.md',
      description: '/ikary-update-primitive — update or version an existing primitive',
    },
    {
      filePath: join(cwd, '.claude', 'settings.json'),
      content: generateClaudeSettings(),
      label: '.claude/settings.json',
      description: 'Bash permissions for ikary commands',
    },
    {
      filePath: join(cwd, '.mcp.json'),
      content: generateMcpConfig(options.local ?? false),
      label: '.mcp.json',
      description: `MCP server → ${mcpUrl}`,
    },
    {
      filePath: join(cwd, 'CLAUDE.md'),
      content: claudeMdContent,
      label: 'CLAUDE.md',
      description: 'AI context and manifest rules',
    },
  ];

  const results: FileResult[] = [];

  for (const { filePath, content, label, description } of files) {
    const status = await writeIfChanged(filePath, content, options.force ?? false);
    results.push({ path: label, label, description, status });
  }

  // ── Report ─────────────────────────────────────────────────────────────
  for (const r of results) {
    const icon =
      r.status === 'created'
        ? theme.success('✓')
        : r.status === 'updated'
          ? theme.accent('↑')
          : theme.muted('○');
    const statusLabel =
      r.status === 'created'
        ? theme.success('created')
        : r.status === 'updated'
          ? theme.accent('updated')
          : theme.muted('exists');

    fmt.body(
      `  ${icon} ${theme.accent(r.label.padEnd(46))} ${statusLabel}  ${theme.muted(r.description)}`,
    );
  }

  fmt.newline();
  fmt.success('Claude Code is ready.');
  fmt.newline();

  // ── Next steps ─────────────────────────────────────────────────────────
  fmt.body('Next steps:');
  fmt.newline();
  fmt.body(`  1. Open Claude Code in this directory:`);
  fmt.body(`     ${theme.accent('claude .')}`);
  fmt.newline();
  fmt.body(`  2. MCP server is configured at: ${theme.accent(mcpUrl)}`);
  if (options.local) {
    fmt.body(`     ${theme.muted('Keep the local stack running with `ikary local start <manifest>`')}`);
  } else {
    fmt.body(
      `     ${theme.muted('Switch to the local stack any time with `ikary setup ai --local`')}`,
    );
  }
  fmt.newline();
  fmt.body(`  3. Use these slash commands inside Claude Code:`);
  fmt.newline();
  fmt.body(`     ${theme.accent('/ikary-bootstrap')}           Build your manifest step by step`);
  fmt.body(`     ${theme.accent('/ikary-add-entity')}          Add a new entity to the manifest`);
  fmt.body(`     ${theme.accent('/ikary-validate')}            Check the manifest for errors`);
  fmt.body(`     ${theme.accent('/ikary-browse-primitives')}   Explore the UI component catalog`);
  fmt.body(`     ${theme.accent('/ikary-create-primitive')}    Scaffold + implement a custom UI primitive`);
  fmt.body(`     ${theme.accent('/ikary-update-primitive')}    Update or version an existing primitive`);
  fmt.newline();
}
