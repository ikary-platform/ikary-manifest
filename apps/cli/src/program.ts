import { Command } from 'commander';
import { configureTheme } from './output/theme.js';
import { initCommand } from './commands/init.js';
import { validateCommand } from './commands/validate.js';
import { compileCommand } from './commands/compile.js';
import { previewCommand } from './commands/preview.js';

export function createProgram(): Command {
  configureTheme();

  const program = new Command();

  program
    .name('ikary')
    .description('IKARY Manifest CLI — generate, validate, compile, and preview Cell manifests')
    .version('0.0.1');

  program
    .command('init [project-name]')
    .description('Create a new Cell manifest project')
    .action(initCommand);

  program
    .command('validate <path>')
    .description('Validate a Cell manifest JSON file')
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

  return program;
}
