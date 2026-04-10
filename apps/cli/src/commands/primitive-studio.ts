import { join } from 'node:path';
import { existsSync } from 'node:fs';
import * as fmt from '../output/format.js';
import { theme } from '../output/theme.js';
import { openBrowser } from '../utils/open-browser.js';
import { PORTS } from '../utils/ports.js';

async function pollHealth(url: string, maxAttempts = 10, intervalMs = 500): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (res.ok) return true;
    } catch {
      // not ready yet
    }
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  return false;
}

export async function primitiveStudioCommand(options: { port?: string }): Promise<void> {
  const port = options.port ?? String(PORTS.PREVIEW);
  const studioUrl = `http://localhost:${port}/__primitive-studio`;
  const healthUrl = `http://localhost:${port}/health`;

  fmt.section('Primitive Studio');
  fmt.newline();

  // Check if a local stack is already running
  const spinner = fmt.createSpinner('Checking local stack...');
  spinner.start();

  const running = await pollHealth(healthUrl, 3, 300);

  if (running) {
    spinner.succeed(theme.success(`Local stack running on port ${port}`));
    fmt.newline();
    fmt.body(`Opening Primitive Studio…`);
    fmt.muted(studioUrl);
    fmt.newline();
    await openBrowser(studioUrl);
    return;
  }

  spinner.stop();

  // Check if we're in a project directory
  const cwd = process.cwd();
  const hasConfig = existsSync(join(cwd, 'ikary-primitives.yaml'));
  const hasManifest = existsSync(join(cwd, 'manifest.json'));

  fmt.body(`No local stack detected on port ${theme.accent(port)}.`);
  fmt.newline();

  if (hasManifest) {
    fmt.body(`Start the local stack first:`);
    fmt.body(`  ${theme.accent('ikary local start manifest.json')}`);
  } else if (hasConfig) {
    fmt.body(`Start the preview server first, then re-run this command.`);
    fmt.body(`Or access the Primitive Studio in the cell-playground:`);
    fmt.body(`  ${theme.accent('http://localhost:5173/primitives')}`);
  } else {
    fmt.muted(`The Primitive Studio is available at:`);
    fmt.body(`  ${theme.accent(studioUrl)}`);
    fmt.muted(`Start your local stack with ${theme.accent('ikary local start manifest.json')} first.`);
  }

  fmt.newline();
}
