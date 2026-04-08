import { resolve, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import * as fmt from '../output/format.js';
import { printHeader } from '../output/header.js';
import { theme } from '../output/theme.js';
import { runInitPrompts } from '../init/prompts.js';
import {
  generateManifestJson,
  generateClaudeMd,
  generateAddEntityCommand,
  generateValidateCommand,
  generateRecommendCommand,
  generateBrowsePrimitivesCommand,
  generateClaudeSettings,
  generateMcpConfig,
} from '../init/templates.js';

export async function initCommand(projectName?: string): Promise<void> {
  printHeader();

  try {
    const options = await runInitPrompts(projectName);
    if (!options) return;

    const projectDir = resolve(options.name);

    if (existsSync(projectDir)) {
      fmt.error(`Directory ${theme.accent(projectDir)} already exists.`);
      process.exitCode = 1;
      return;
    }

    fmt.section('Creating project');
    fmt.newline();

    const spinner = fmt.createSpinner('Scaffolding...');
    spinner.start();

    // Create directories
    await mkdir(projectDir, { recursive: true });
    await mkdir(join(projectDir, '.claude', 'commands'), { recursive: true });
    await mkdir(join(projectDir, '.ikary'), { recursive: true });

    // Write manifest.json
    await writeFile(join(projectDir, 'manifest.json'), generateManifestJson(options), 'utf-8');

    // Write CLAUDE.md
    await writeFile(join(projectDir, 'CLAUDE.md'), generateClaudeMd(options), 'utf-8');

    // Write Claude Code slash commands
    await writeFile(join(projectDir, '.claude', 'commands', 'add-entity.md'), generateAddEntityCommand(), 'utf-8');
    await writeFile(join(projectDir, '.claude', 'commands', 'validate.md'), generateValidateCommand(), 'utf-8');
    await writeFile(join(projectDir, '.claude', 'commands', 'recommend.md'), generateRecommendCommand(), 'utf-8');
    await writeFile(join(projectDir, '.claude', 'commands', 'browse-primitives.md'), generateBrowsePrimitivesCommand(), 'utf-8');

    // Write Claude Code settings
    await writeFile(join(projectDir, '.claude', 'settings.json'), generateClaudeSettings(), 'utf-8');

    // Write MCP config for Claude Code
    if (options.aiTool === 'claude-code') {
      await writeFile(join(projectDir, '.mcp.json'), generateMcpConfig(), 'utf-8');
    }

    spinner.succeed(theme.success('Project created'));

    fmt.newline();
    fmt.body('Created:');
    fmt.body(`  ${theme.accent('manifest.json')}          Cell Manifest`);
    fmt.body(`  ${theme.accent('CLAUDE.md')}              AI context for Claude Code`);
    fmt.body(`  ${theme.accent('.claude/commands/')}       Slash commands (/add-entity, /validate, /recommend, /browse-primitives)`);
    fmt.body(`  ${theme.accent('.claude/settings.json')}   Permissions for ikary CLI`);
    if (options.aiTool === 'claude-code') {
      fmt.body(`  ${theme.accent('.mcp.json')}              MCP server config (ikary-manifest)`);
    }

    fmt.section('Install');
    fmt.newline();
    fmt.body(`  ${theme.accent('npm install -g @ikary/cli')}`);
    fmt.newline();
    fmt.muted('  This registers the ikary command globally.');
    fmt.muted('  Alternatively, prefix commands with npx:');
    fmt.muted(`  npx @ikary/cli validate manifest.json`);

    fmt.section('Next steps');
    fmt.newline();
    fmt.body(`  ${theme.accent('cd ' + options.name)}`);
    if (options.aiTool === 'claude-code') {
      fmt.body(`  ${theme.accent('claude')}                   Open Claude Code`);
      fmt.body(`  ${theme.accent('/recommend')}               Scaffold entities from your app description`);
      fmt.body(`  ${theme.accent('/add-entity')}              Add entities one at a time`);
      fmt.body(`  ${theme.accent('/browse-primitives')}       Explore available UI components`);
    } else {
      fmt.body(`  Edit ${theme.accent('manifest.json')} to add entities`);
    }
    fmt.body(`  ${theme.accent('ikary validate manifest.json')}   Validate your manifest`);
    fmt.body(`  ${theme.accent('ikary preview manifest.json')}    Preview in the playground`);
    fmt.newline();
  } catch (err) {
    fmt.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
