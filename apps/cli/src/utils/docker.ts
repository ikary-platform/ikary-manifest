import { spawn, execSync } from 'node:child_process';

export type ContainerRuntime = 'docker' | 'podman';

export function getContainerRuntime(): ContainerRuntime | null {
  for (const cmd of ['docker', 'podman'] as const) {
    try {
      execSync(`${cmd} info --format '{{.ServerVersion}}'`, { stdio: 'ignore' });
      return cmd;
    } catch {
      // not available or daemon not running
    }
  }
  return null;
}

export interface RunComposeOptions {
  env?: Record<string, string>;
  stdio?: 'inherit' | 'pipe';
}

export function runCompose(
  args: string[],
  composePath: string,
  opts: RunComposeOptions = {},
): Promise<{ code: number; stdout: string; stderr: string }> {
  const runtime = getContainerRuntime();
  if (!runtime) throw new Error('Docker or Podman is required but not found.');

  return new Promise((resolve, reject) => {
    const fullArgs = ['compose', '-f', composePath, ...args];
    const child = spawn(runtime, fullArgs, {
      stdio: opts.stdio === 'inherit' ? 'inherit' : 'pipe',
      env: { ...process.env, ...opts.env },
    });

    let stdout = '';
    let stderr = '';

    if (opts.stdio !== 'inherit') {
      child.stdout?.on('data', (d) => (stdout += d.toString()));
      child.stderr?.on('data', (d) => (stderr += d.toString()));
    }

    child.on('error', reject);
    child.on('close', (code) => resolve({ code: code ?? 0, stdout, stderr }));
  });
}

export async function waitForHealth(url: string, timeoutMs = 30_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  let delay = 500;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.5, 3000);
  }
  return false;
}

export function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require('node:net');
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close(() => resolve(false));
    });
    server.listen(port, '127.0.0.1');
  });
}
