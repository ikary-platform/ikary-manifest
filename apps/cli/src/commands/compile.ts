import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
import * as fmt from '../output/format.js';
import { compileManifestJson } from '../utils/manifest-loader.js';
import { theme } from '../output/theme.js';

export async function compileCommand(path: string, options: { output?: string; stdout?: boolean }): Promise<void> {
  const filePath = resolve(path);
  fmt.section('Compiling manifest');
  fmt.muted(filePath);
  fmt.newline();

  const spinner = fmt.createSpinner('Compiling...');
  spinner.start();

  try {
    const result = await compileManifestJson(filePath);

    if (!result.valid) {
      spinner.fail(theme.error(`Compilation failed with ${result.errors.length} error(s)`));
      fmt.newline();
      for (const err of result.errors) {
        fmt.error(`${theme.muted(err.path || 'root')} ${err.message}`);
      }
      fmt.newline();
      process.exitCode = 1;
      return;
    }

    spinner.succeed(theme.success('Compiled successfully'));

    const json = JSON.stringify(result.compiled, null, 2);

    if (options.stdout) {
      console.log(json);
      return;
    }

    const outputPath = options.output ? resolve(options.output) : filePath.replace(/\.json$/, '.compiled.json');
    await writeFile(outputPath, json, 'utf-8');
    fmt.newline();
    fmt.success(`Written to ${theme.accent(outputPath)}`);
    fmt.newline();
  } catch (err) {
    spinner.fail(theme.error('Compilation failed'));
    fmt.newline();
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}
