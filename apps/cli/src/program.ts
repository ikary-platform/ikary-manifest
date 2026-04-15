import { Command } from 'commander';
import { configureTheme } from './output/theme.js';
import { initCommand } from './commands/init.js';
import { setupAiCommand } from './commands/setup.js';
import { validateCommand } from './commands/validate.js';
import { compileCommand } from './commands/compile.js';
import { previewCommand } from './commands/preview.js';
import {
  localStartCommand,
  localStopCommand,
  localStatusCommand,
  localLogsCommand,
  localResetDataCommand,
} from './commands/local.js';
import {
  localDbMigrateCommand,
  localDbStatusCommand,
  localDbResetCommand,
} from './commands/local-db.js';
import { primitiveAddCommand } from './commands/primitive-add.js';
import { primitiveValidateCommand } from './commands/primitive-validate.js';
import { primitiveStudioCommand } from './commands/primitive-studio.js';
import { primitiveListCommand } from './commands/primitive-list.js';
import {
  localizeInitCommand,
  localizeBuildCommand,
  localizeExtractCommand,
  localizeMissingCommand,
  localizeSyncCommand,
} from './commands/localize.js';

export function createProgram(): Command {
  configureTheme();

  const program = new Command();

  program
    .name('ikary')
    .description('IKARY Manifest CLI — generate, validate, compile, and preview Cell manifests')
    .version(process.env.CLI_VERSION ?? '0.0.0')
    .option('--offline', 'Skip API calls and use local validation only')
    .hook('preAction', () => {
      if (program.opts().offline) {
        process.env.IKARY_OFFLINE = '1';
      }
    });

  program
    .command('init [project-name]')
    .description('Create a new Cell manifest project')
    .action(initCommand);

  const setup = program
    .command('setup')
    .description('Configure tools and integrations for the current project');

  setup
    .command('ai')
    .description('Set up Claude Code integration (MCP server, slash commands, CLAUDE.md)')
    .option('--local', 'Point the MCP server at the local stack (http://localhost:4502/mcp)')
    .option('--force', 'Overwrite existing files')
    .action(setupAiCommand);

  program
    .command('validate <path>')
    .description('Validate a Cell manifest JSON file')
    .option('--explain', 'Explain validation errors with fix suggestions')
    .action(validateCommand);

  program
    .command('compile <path>')
    .description('Compile a Cell manifest to normalized JSON')
    .option('-o, --output <file>', 'Output file path')
    .option('--stdout', 'Write compiled JSON to stdout')
    .action(compileCommand);

  program
    .command('preview <path>')
    .description('Preview a Cell manifest in the playground')
    .option('-p, --port <port>', 'Dev server port', '4500')
    .action(previewCommand);

  const local = program
    .command('local')
    .description('Manage the local IKARY stack (preview server + data API + MCP server)');

  local
    .command('start <manifest>')
    .description('Start the local stack for a manifest file')
    .action(localStartCommand);

  local
    .command('stop')
    .description('Stop the local stack')
    .action(localStopCommand);

  local
    .command('status')
    .description('Show the status of the local stack')
    .action(localStatusCommand);

  local
    .command('logs [service]')
    .description('Show logs from the local stack')
    .option('-f, --follow', 'Follow log output')
    .action(localLogsCommand);

  local
    .command('reset-data')
    .description('Delete the local PostgreSQL data volume (stops the stack first)')
    .action(localResetDataCommand);

  const localDb = local.command('db').description('Database migration commands');

  localDb
    .command('migrate')
    .description('Apply pending database migrations for all installed @ikary/* packages')
    .option(
      '--database-url <url>',
      'Database connection URL (default: DATABASE_URL env or postgres://ikary:ikary@localhost:5432/ikary)',
    )
    .option('--dry-run', 'Print pending migrations without applying them')
    .option('--force', 'Re-apply all migrations even if already tracked')
    .action(localDbMigrateCommand);

  localDb
    .command('status')
    .description('Show which migrations have been applied')
    .option('--database-url <url>', 'Database connection URL')
    .action(localDbStatusCommand);

  localDb
    .command('reset')
    .description('Clear migration tracking so all migrations run again (dev only)')
    .option('--database-url <url>', 'Database connection URL')
    .option('--yes', 'Confirm the reset without prompting')
    .action(localDbResetCommand);

  const primitive = program
    .command('primitive')
    .description('Manage UI primitives (scaffold, validate, list, preview)');

  primitive
    .command('add <name>')
    .description('Scaffold a new custom primitive in the current project')
    .option('--category <cat>', 'Primitive category (data|form|layout|feedback|navigation|custom)')
    .option('--label <label>', 'Display label')
    .option('--description <desc>', 'Short description')
    .action(primitiveAddCommand);

  primitive
    .command('validate')
    .description('Validate all custom primitives in ikary-primitives.yaml')
    .action(primitiveValidateCommand);

  primitive
    .command('studio')
    .description('Open the Primitive Studio in the browser')
    .option('-p, --port <port>', 'Local stack port', '4500')
    .action(primitiveStudioCommand);

  primitive
    .command('list')
    .description('List all registered primitives (core + custom)')
    .option('--json', 'Output as JSON')
    .action(primitiveListCommand);

  const localize = program
    .command('localize')
    .description('Manage application localization (translations and i18n catalogs)');

  localize
    .command('init')
    .description('Scaffold localization config and starter locale files')
    .option('--path <path>', 'Cell package root', '.')
    .option('--default-locale <code>', 'Default locale code', 'en')
    .option('--locales <codes>', 'Comma-separated supported locales (defaults to --default-locale)')
    .option('--force', 'Overwrite existing files', false)
    .action(localizeInitCommand);

  localize
    .command('build')
    .description('Discover locale sources, merge catalogs, generate JSON artifacts')
    .option('--app <path>', 'Cell package root', '.')
    .option('--watch', 'Watch locale sources and rebuild on change', false)
    .option('--fail-on-missing', 'Treat missing translated keys as errors', false)
    .option('--fail-on-duplicate', 'Treat duplicate message ids as errors', false)
    .action(localizeBuildCommand);

  localize
    .command('extract')
    .description('Scan source files for translation keys and write a catalog')
    .option('--app <path>', 'Cell package root', '.')
    .action(localizeExtractCommand);

  localize
    .command('missing')
    .description('Report missing translations for a locale')
    .requiredOption('--lang <code>', 'Target locale code (e.g. en, fr)')
    .option('--app <path>', 'Cell package root', '.')
    .option('--strict', 'Exit with non-zero status when keys are missing')
    .action(localizeMissingCommand);

  localize
    .command('sync')
    .description('Sync extracted keys with the translation catalog')
    .option('--app <path>', 'Cell package root', '.')
    .option('--check', 'Report drift without updating the catalog')
    .action(localizeSyncCommand);

  return program;
}
