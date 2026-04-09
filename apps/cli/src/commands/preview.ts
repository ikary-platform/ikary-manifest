import { resolve, join } from 'node:path';
import { writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as fmt from '../output/format.js';
import { compileManifestJson } from '../utils/manifest-loader.js';
import { generatePreviewHtml } from '../utils/generate-preview-html.js';
import { openBrowser } from '../utils/open-browser.js';
import { theme } from '../output/theme.js';

/** Absolute path to the bundled renderer IIFE shipped with the CLI. */
function getRendererBundlePath(): string | null {
  try {
    const __dirname = fileURLToPath(new URL('.', import.meta.url));
    const bundlePath = join(__dirname, 'assets', 'renderer.iife.js');
    return existsSync(bundlePath) ? bundlePath : null;
  } catch {
    return null;
  }
}

export async function previewCommand(path: string, _options: { port?: string }): Promise<void> {
  const filePath = resolve(path);
  fmt.section('Preview manifest');
  fmt.muted(filePath);
  fmt.newline();

  const bundlePath = getRendererBundlePath();
  if (!bundlePath) {
    // Fallback: direct to the online playground
    fmt.body('No local renderer bundle found. Open the IKARY Playground:');
    fmt.newline();
    fmt.body(`  ${theme.accent('https://documentation.ikary.co/playground/app-runtime')}`);
    fmt.newline();
    fmt.body(`  Run ${theme.accent('ikary compile ' + path + ' --stdout')} and paste the output there.`);
    fmt.newline();
    return;
  }

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

    spinner.text = 'Generating preview...';

    // Use a stable temp directory keyed by manifest path so re-runs reuse it
    const hash = createHash('sha1').update(filePath).digest('hex').slice(0, 8);
    const previewDir = join(tmpdir(), `ikary-preview-${hash}`);
    mkdirSync(previewDir, { recursive: true });

    const htmlPath = join(previewDir, 'index.html');
    writeFileSync(htmlPath, generatePreviewHtml(result.compiled ?? result.manifest));
    copyFileSync(bundlePath, join(previewDir, 'renderer.iife.js'));

    spinner.succeed(theme.success('Preview ready'));
    fmt.newline();
    fmt.body(`Opening preview in your browser…`);
    fmt.newline();
    fmt.muted(htmlPath);
    fmt.newline();

    await openBrowser(htmlPath);
  } catch (err) {
    spinner.fail(theme.error('Preview failed'));
    fmt.newline();
    fmt.error(err instanceof Error ? err.message : String(err));
    fmt.newline();
    process.exitCode = 1;
  }
}
