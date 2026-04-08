import { resolve } from 'node:path';
import * as fmt from '../output/format.js';
import { compileManifestJson } from '../utils/manifest-loader.js';
import { theme } from '../output/theme.js';

export async function previewCommand(path: string, _options: { port?: string }): Promise<void> {
  const filePath = resolve(path);
  fmt.section('Preview manifest');
  fmt.muted(filePath);
  fmt.newline();

  const spinner = fmt.createSpinner('Compiling manifest...');
  spinner.start();

  try {
    const result = await compileManifestJson(filePath);

    if (!result.valid) {
      spinner.fail(theme.error('Manifest has errors. Fix them before previewing.'));
      fmt.newline();
      for (const err of result.errors) {
        fmt.error(`${theme.muted(err.path || 'root')} ${err.message}`);
      }
      process.exitCode = 1;
      return;
    }

    spinner.succeed(theme.success('Manifest compiled'));
    fmt.newline();
    fmt.body('To preview your manifest:');
    fmt.newline();
    fmt.body(`  1. Open the IKARY Playground:`);
    fmt.body(`     ${theme.accent('https://documentation.ikary.co/playground/app-runtime')}`);
    fmt.newline();
    fmt.body(`  2. Paste the full Cell Manifest JSON into the left panel`);
    fmt.newline();
    fmt.body(`  3. Or run ${theme.accent('ikary compile ' + path + ' --stdout')} and copy the output`);
    fmt.newline();
    fmt.muted('Tip: A local preview server is coming in a future release.');
    fmt.newline();
  } catch (err) {
    spinner.fail(theme.error('Preview failed'));
    fmt.newline();
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}
