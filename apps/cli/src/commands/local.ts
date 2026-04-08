import { resolve, dirname, basename } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as fmt from '../output/format.js';
import { theme } from '../output/theme.js';
import { getContainerRuntime, runCompose, waitForHealth, isPortInUse } from '../utils/docker.js';

function getComposePath(): string {
  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  // In production dist: cli.js is at dist/cli.js, compose is at ../../docker-compose.yml
  const candidate = resolve(__dirname, '..', '..', 'docker-compose.yml');
  if (existsSync(candidate)) return candidate;
  // Fallback for dev
  return resolve(__dirname, '..', '..', '..', '..', 'docker-compose.yml');
}

export async function localStartCommand(
  manifestPath: string,
  _options: Record<string, unknown>,
): Promise<void> {
  fmt.section('Starting IKARY local stack');

  const runtime = getContainerRuntime();
  if (!runtime) {
    fmt.error('Docker or Podman is required but not found. Install Docker Desktop or Podman.');
    process.exitCode = 1;
    return;
  }

  const filePath = resolve(manifestPath);
  if (!existsSync(filePath)) {
    fmt.error(`Manifest not found: ${filePath}`);
    process.exitCode = 1;
    return;
  }

  // Check for port conflicts
  const conflicts: number[] = [];
  for (const port of [3000, 4000, 3100]) {
    if (await isPortInUse(port)) conflicts.push(port);
  }
  if (conflicts.length > 0) {
    fmt.error(`Port(s) already in use: ${conflicts.join(', ')}. Stop the conflicting processes and retry.`);
    process.exitCode = 1;
    return;
  }

  const composePath = getComposePath();
  const manifestDir = dirname(filePath);
  const manifestFile = basename(filePath);

  fmt.muted(`Manifest: ${filePath}`);
  fmt.muted(`Runtime:  ${runtime}`);
  fmt.newline();

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
    spinner.warn(theme.warning('Some services may still be starting up'));
  } else {
    spinner.succeed(theme.success('All services healthy'));
  }

  fmt.newline();
  fmt.body('Services:');
  fmt.newline();
  fmt.body(`  Preview     ${theme.accent('http://localhost:3000')}`);
  fmt.body(`  Data API    ${theme.accent('http://localhost:4000')}`);
  fmt.body(`  MCP Server  ${theme.accent('http://localhost:3100/mcp')}`);
  fmt.newline();
  fmt.muted('Run `ikary local stop` to shut down.');
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

  const spinner = fmt.createSpinner('Stopping containers…');
  spinner.start();

  const composePath = getComposePath();
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
  const { code: downCode } = await runCompose(['down'], composePath);
  if (downCode !== 0) {
    spinner.fail(theme.error('Failed to stop containers before reset'));
    process.exitCode = 1;
    return;
  }

  const { code, stderr } = await runCompose(['volume', 'rm', 'ikary-local-data'], composePath);

  if (code !== 0 && !stderr.includes('no such volume')) {
    spinner.fail(theme.error('Failed to remove data volume'));
    fmt.error(stderr);
    process.exitCode = 1;
    return;
  }

  spinner.succeed(theme.success('Data reset. Run `ikary local start <manifest>` to restart.'));
  fmt.newline();
}
