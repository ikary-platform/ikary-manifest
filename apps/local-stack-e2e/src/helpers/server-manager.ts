import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { unlinkSync, existsSync } from 'node:fs';

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
  /** JWT token for authenticated requests (null if auth bootstrap failed). */
  token: string | null;
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

/** Spawn cell-runtime-api on the E2E port with a temp SQLite file. */
export async function startApiServer(manifestPath: string): Promise<ServerHandle> {
  // Use a temp file instead of :memory: so the app DB and auth DB share
  // the same SQLite instance (each :memory: connection gets a separate DB).
  const dbPath = join(tmpdir(), `ikary-e2e-${process.pid}-${Date.now()}.db`);
  const dbUrl = `sqlite://${dbPath}`;

  const { stop: rawStop } = spawnServer(API_SERVER_PATH, {
    IKARY_MANIFEST_PATH: manifestPath,
    DATABASE_URL: dbUrl,
    PORT: String(API_PORT),
  });

  const stop = async () => {
    await rawStop();
    if (existsSync(dbPath)) unlinkSync(dbPath);
  };

  try {
    await waitForHttp(`http://localhost:${API_PORT}/health`);
  } catch (err) {
    await stop();
    throw err;
  }

  // Fetch preview token for authenticated E2E requests
  let token: string | null = null;
  try {
    const res = await fetch(`http://localhost:${API_PORT}/auth/preview-token`);
    if (res.ok) {
      const data = (await res.json()) as { token?: string };
      token = data.token ?? null;
    }
  } catch {
    // auth bootstrap may have failed — tests that need auth will skip
  }

  return { manifestPath, token, stop };
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
