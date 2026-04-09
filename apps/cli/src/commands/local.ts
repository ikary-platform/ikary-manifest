import { resolve, dirname, basename } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as fmt from '../output/format.js';
import { theme } from '../output/theme.js';
import { getContainerRuntime, runCompose, runVolumeRm, waitForHealth, isPortInUse } from '../utils/docker.js';

function getComposePath(): string | null {
  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  // Walk up from the dist directory to find docker-compose.yml
  // dist/ → cli/ → apps/ → ikary-manifest/ (root)
  const candidates = [
    resolve(__dirname, '..', '..', '..', 'docker-compose.yml'),   // from dist/
    resolve(__dirname, '..', '..', 'docker-compose.yml'),          // from src/ (dev)
    resolve(__dirname, '..', '..', '..', '..', 'docker-compose.yml'), // fallback
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

export async function localStartCommand(
  manifestPath: string,
  _options: Record<string, unknown>,
): Promise<void> {
  fmt.section('Starting IKARY local stack');
  fmt.newline();

  // ── Pre-flight checks ────────────────────────────────────────────────────
  fmt.body('Pre-flight checks:');
  fmt.newline();

  let ok = true;

  // 1. Manifest file
  const filePath = resolve(manifestPath);
  const manifestOk = existsSync(filePath);
  fmt.body(
    `  ${manifestOk ? theme.success('✓') : theme.error('✗')} Manifest          ${manifestOk ? theme.muted(filePath) : theme.error(`not found: ${filePath}`)}`,
  );
  if (!manifestOk) ok = false;

  // 2. Docker / Podman daemon
  const runtime = getContainerRuntime();
  const dockerOk = runtime !== null;
  fmt.body(
    `  ${dockerOk ? theme.success('✓') : theme.error('✗')} Container runtime ${dockerOk ? theme.muted(`${runtime} running`) : theme.error('Docker or Podman daemon not running — start Docker Desktop')}`,
  );
  if (!dockerOk) ok = false;

  // 3. docker-compose.yml
  const composePath = getComposePath();
  const composeOk = composePath !== null;
  fmt.body(
    `  ${composeOk ? theme.success('✓') : theme.error('✗')} docker-compose.yml ${composeOk ? theme.muted(composePath!) : theme.error('not found — run this command from the ikary-manifest repo')}`,
  );
  if (!composeOk) ok = false;

  // 4. Port availability
  const portChecks = await Promise.all(
    [
      { port: 3000, name: 'Preview   (3000)' },
      { port: 4000, name: 'Data API  (4000)' },
      { port: 3100, name: 'MCP Server(3100)' },
    ].map(async ({ port, name }) => ({ port, name, inUse: await isPortInUse(port) })),
  );
  for (const { name, inUse } of portChecks) {
    fmt.body(
      `  ${inUse ? theme.error('✗') : theme.success('✓')} Port ${name}   ${inUse ? theme.error('already in use — stop the conflicting process') : theme.muted('free')}`,
    );
    if (inUse) ok = false;
  }

  fmt.newline();

  if (!ok) {
    fmt.error('Fix the issues above, then re-run ikary local start.');
    process.exitCode = 1;
    return;
  }

  const manifestDir = dirname(filePath);
  const manifestFile = basename(filePath);

  const spinner = fmt.createSpinner('Starting containers…');
  spinner.start();

  const { code, stderr } = await runCompose(
    ['up', '--build', '--pull', 'always', '-d'],
    composePath,
    { env: { IKARY_MANIFEST_DIR: manifestDir, IKARY_MANIFEST_FILE: manifestFile } },
  );

  if (code !== 0) {
    spinner.fail(theme.error('Failed to start containers'));
    fmt.newline();
    fmt.error(stderr);
    process.exitCode = 1;
    return;
  }

  spinner.text = 'Waiting for services to be healthy…';

  const services = [
    { name: 'MCP Server', url: 'http://localhost:3100/health' },
    { name: 'Data API', url: 'http://localhost:4000/health' },
    { name: 'Preview', url: 'http://localhost:3000/health' },
  ];

  const results = await Promise.all(services.map((s) => waitForHealth(s.url, 60_000)));
  const allHealthy = results.every(Boolean);

  if (!allHealthy) {
    spinner.warn(theme.muted('Some services may still be starting up'));
  } else {
    spinner.succeed(theme.success('All services healthy'));
  }

  fmt.newline();
  fmt.body('Services:');
  fmt.newline();
  fmt.body(`  ${theme.bold('Preview')}     ${theme.accent('http://localhost:3000')}`);
  fmt.body(`  ${theme.bold('Data API')}    ${theme.accent('http://localhost:4000')}`);
  fmt.body(`  ${theme.bold('MCP Server')}  ${theme.accent('http://localhost:3100/mcp')}`);
  fmt.newline();
  fmt.body('Next steps:');
  fmt.newline();
  fmt.body(`  1. Open the preview in your browser:`);
  fmt.body(`     ${theme.accent('http://localhost:3000')}`);
  fmt.newline();
  fmt.body(`  2. Add the MCP server to your AI assistant (Cursor, Claude Desktop…):`);
  fmt.body(`     ${theme.muted('Type:  ')  }${theme.accent('http://localhost:3100/mcp')}`);
  fmt.newline();
  fmt.body(`  3. Connect your AI assistant to the local MCP server:`);
  fmt.body(`     ${theme.accent('ikary setup ai --local')}`);
  fmt.body(`     ${theme.muted('Then open Claude Code with `claude .` — all tools point at localhost')}`);
  fmt.newline();
  fmt.body(`  4. Edit your manifest file — the preview hot-reloads automatically.`);
  fmt.newline();
  fmt.muted('Useful commands:');
  fmt.muted('  ikary local logs [service]   stream container logs');
  fmt.muted('  ikary local status           show container status');
  fmt.muted('  ikary local stop             shut down the stack');
  fmt.newline();
}

export async function localStopCommand(_options: Record<string, unknown>): Promise<void> {
  fmt.section('Stopping IKARY local stack');

  const runtime = getContainerRuntime();
  if (!runtime) {
    fmt.error('Docker or Podman not found.');
    process.exitCode = 1;
    return;
  }

  const composePath = getComposePath();
  if (!composePath) {
    fmt.error('docker-compose.yml not found — run this command from the ikary-manifest repo.');
    process.exitCode = 1;
    return;
  }

  const spinner = fmt.createSpinner('Stopping containers…');
  spinner.start();

  const { code } = await runCompose(['down'], composePath);

  if (code !== 0) {
    spinner.fail(theme.error('Failed to stop containers'));
    process.exitCode = 1;
    return;
  }

  spinner.succeed(theme.success('Stopped'));
  fmt.newline();
}

export async function localStatusCommand(_options: Record<string, unknown>): Promise<void> {
  const composePath = getComposePath();
  if (!composePath) {
    fmt.body('No IKARY local stack is running.');
    return;
  }
  const { code, stdout } = await runCompose(['ps'], composePath, { stdio: 'pipe' });

  if (code !== 0 || !stdout.trim()) {
    fmt.body('No IKARY local stack is running.');
    return;
  }

  fmt.section('IKARY local stack status');
  fmt.body(stdout);
}

export async function localLogsCommand(
  service: string | undefined,
  options: { follow?: boolean },
): Promise<void> {
  const composePath = getComposePath();
  if (!composePath) {
    fmt.error('docker-compose.yml not found.');
    process.exitCode = 1;
    return;
  }
  const args = ['logs', '--tail', '100'];
  if (options.follow) args.push('--follow');
  if (service) args.push(service);

  await runCompose(args, composePath, { stdio: 'inherit' });
}

export async function localResetDataCommand(_options: Record<string, unknown>): Promise<void> {
  fmt.section('Resetting local entity data');

  const runtime = getContainerRuntime();
  if (!runtime) {
    fmt.error('Docker or Podman not found.');
    process.exitCode = 1;
    return;
  }

  const spinner = fmt.createSpinner('Removing data volume…');
  spinner.start();

  const composePath = getComposePath();
  if (!composePath) {
    spinner.fail(theme.error('docker-compose.yml not found.'));
    process.exitCode = 1;
    return;
  }
  const { code: downCode } = await runCompose(['down'], composePath);
  if (downCode !== 0) {
    spinner.fail(theme.error('Failed to stop containers before reset'));
    process.exitCode = 1;
    return;
  }

  const { code, stderr } = await runVolumeRm('ikary-local-data');

  if (code !== 0 && !stderr.includes('no such volume')) {
    spinner.fail(theme.error('Failed to remove data volume'));
    fmt.error(stderr);
    process.exitCode = 1;
    return;
  }

  spinner.succeed(theme.success('Data reset. Run `ikary local start <manifest>` to restart.'));
  fmt.newline();
}
