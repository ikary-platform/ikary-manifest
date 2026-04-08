import { resolve } from 'node:path';
import * as fmt from '../output/format.js';
import { loadManifestJson } from '../utils/manifest-loader.js';
import { theme } from '../output/theme.js';
import { api } from '../api/index.js';

export async function validateCommand(path: string, options: { explain?: boolean }): Promise<void> {
  const filePath = resolve(path);
  fmt.section('Validating manifest');
  fmt.muted(filePath);
  fmt.newline();

  const spinner = fmt.createSpinner('Parsing and validating...');
  spinner.start();

  try {
    const result = await loadManifestJson(filePath);

    if (result.valid) {
      spinner.succeed(theme.success('Manifest is valid'));
      fmt.newline();
      const manifest = result.manifest as any;
      const entities = manifest?.spec?.entities?.length ?? 0;
      const pages = manifest?.spec?.pages?.length ?? 0;
      const roles = manifest?.spec?.roles?.length ?? 0;
      fmt.body(`  Entities: ${theme.accent(String(entities))}`);
      fmt.body(`  Pages:    ${theme.accent(String(pages))}`);
      fmt.body(`  Roles:    ${theme.accent(String(roles))}`);
      fmt.newline();
    } else {
      spinner.fail(theme.error(`Found ${result.errors.length} error(s)`));
      fmt.newline();
      for (const err of result.errors) {
        const location = err.path || 'root';
        fmt.error(`${theme.muted(location)} ${err.message}`);
      }

      if (options.explain && result.errors.length > 0) {
        fmt.newline();
        const apiErrors = result.errors.map((e) => ({ field: e.path, message: e.message }));
        const explained = await api.explainErrors(apiErrors);
        if (explained.ok && explained.data.length > 0) {
          fmt.section('Explanations');
          fmt.newline();
          for (const ex of explained.data) {
            fmt.body(`  ${theme.accent(ex.path)}`);
            fmt.body(`  Problem: ${ex.problem}`);
            fmt.body(`  Fix:     ${ex.fix}`);
            fmt.newline();
          }
        }
      }

      fmt.newline();
      process.exitCode = 1;
    }
  } catch (err) {
    spinner.fail(theme.error('Validation failed'));
    fmt.newline();
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}
