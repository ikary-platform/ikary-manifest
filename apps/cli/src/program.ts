import { Command } from 'commander';
import { configureTheme } from './output/theme.js';
import { initCommand } from './commands/init.js';
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
    .option('-p, --port <port>', 'Dev server port', '3000')
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
    .description('Delete the local SQLite data volume (stops the stack first)')
    .action(localResetDataCommand);

  return program;
}
