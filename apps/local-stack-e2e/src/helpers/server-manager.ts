import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// From src/helpers/ → apps/local-stack-e2e/ → apps/ → repo root
const REPO_ROOT = resolve(__dirname, '../../../..');

const API_SERVER_PATH = join(REPO_ROOT, 'apps/cell-runtime-api/dist/main.js');
const PREVIEW_SERVER_PATH = join(REPO_ROOT, 'apps/preview-server/server.mjs');

const API_PORT = 4511;
const PREVIEW_PORT = 4510;

export interface ServerHandle {
  manifestPath: string;
  stop: () => Promise<void>;
}

async function waitForHttp(url: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (err) {
      lastError = err;
    }
    await new Promise<void>((r) => setTimeout(r, 300));
  }
  throw new Error(`Timeout waiting for ${url} (last error: ${lastError})`);
}

function spawnServer(
  scriptPath: string,
  env: NodeJS.ProcessEnv,
): { proc: ChildProcess; stop: () => Promise<void> } {
  const proc = spawn('node', [scriptPath], {
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stdout?.on('data', (chunk: Buffer) => process.stdout.write(chunk));
  proc.stderr?.on('data', (chunk: Buffer) => process.stderr.write(chunk));

  const stop = (): Promise<void> =>
    new Promise<void>((res) => {
      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        res();
      }, 5_000);
      proc.once('exit', () => {
        clearTimeout(timer);
        res();
      });
      proc.kill('SIGTERM');
    });

  return { proc, stop };
}

/** Spawn cell-runtime-api on port 4100 with an in-memory SQLite database. */
export async function startApiServer(manifestPath: string): Promise<ServerHandle> {
  const { stop } = spawnServer(API_SERVER_PATH, {
    IKARY_MANIFEST_PATH: manifestPath,
    DATABASE_URL: 'sqlite://:memory:',
    PORT: String(API_PORT),
  });

  try {
    await waitForHttp(`http://localhost:${API_PORT}/health`);
  } catch (err) {
    await stop();
    throw err;
  }

  return { manifestPath, stop };
}

/** Spawn preview-server on port 3001. */
export async function startPreviewServer(
  manifestPath: string,
  opts?: { dataApiUrl?: string },
): Promise<ServerHandle> {
  const env: NodeJS.ProcessEnv = {
    IKARY_MANIFEST_PATH: manifestPath,
    PORT: String(PREVIEW_PORT),
  };
  if (opts?.dataApiUrl) {
    env['VITE_DATA_API_URL'] = opts.dataApiUrl;
  }
  const { stop } = spawnServer(PREVIEW_SERVER_PATH, env);

  try {
    await waitForHttp(`http://localhost:${PREVIEW_PORT}/health`);
  } catch (err) {
    await stop();
    throw err;
  }

  return { manifestPath, stop };
}
